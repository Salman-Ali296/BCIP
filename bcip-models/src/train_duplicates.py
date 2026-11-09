"""Train and evaluate text-only pairwise duplicate detection.

Positive means same incident, not merely same topic. Features are symmetric and
computed from the two raw texts; incident IDs and gold category labels are never
used as predictors.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, average_precision_score, confusion_matrix, f1_score,
    precision_recall_curve, precision_score, recall_score, roc_auc_score,
)

ROOT = Path(__file__).resolve().parents[1]
REF_RE = re.compile(r"\bPK-\d{6}\b", flags=re.IGNORECASE)
NUMBER_RE = re.compile(r"\b\d+(?:\.\d+)?\b")
TOKEN_RE = re.compile(r"\w+", flags=re.UNICODE)
URDU_RE = re.compile(r"[\u0600-\u06FF]")
FEATURE_NAMES = [
    "word_cosine", "char_cosine", "token_jaccard", "token_containment",
    "sequence_ratio", "length_ratio", "number_jaccard", "reference_both",
    "reference_match", "same_urdu_script",
]


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", str(text).lower()).strip()


def sparse_row_cosine(x1, x2) -> np.ndarray:
    # TfidfVectorizer applies L2 normalization by default.
    return np.asarray(x1.multiply(x2).sum(axis=1)).ravel()


def scalar_features(left: str, right: str) -> list[float]:
    a, b = normalize(left), normalize(right)
    ta, tb = set(TOKEN_RE.findall(a)), set(TOKEN_RE.findall(b))
    union = len(ta | tb)
    intersection = len(ta & tb)
    na, nb = set(NUMBER_RE.findall(a)), set(NUMBER_RE.findall(b))
    nunion = len(na | nb)
    ra, rb = REF_RE.findall(a), REF_RE.findall(b)
    ref_both = float(bool(ra and rb))
    ref_match = float(bool(ra and rb and {x.upper() for x in ra} & {x.upper() for x in rb}))
    return [
        intersection / union if union else 0.0,
        intersection / min(len(ta), len(tb)) if ta and tb else 0.0,
        difflib.SequenceMatcher(None, a, b).ratio(),
        min(len(a), len(b)) / max(len(a), len(b)) if a and b else 0.0,
        len(na & nb) / nunion if nunion else 0.0,
        ref_both,
        ref_match,
        float(bool(URDU_RE.search(a)) == bool(URDU_RE.search(b))),
    ]


def pair_features(left_texts, right_texts, word_vectorizer, char_vectorizer) -> np.ndarray:
    left_texts, right_texts = list(left_texts), list(right_texts)
    wx1, wx2 = word_vectorizer.transform(left_texts), word_vectorizer.transform(right_texts)
    cx1, cx2 = char_vectorizer.transform(left_texts), char_vectorizer.transform(right_texts)
    dense = np.asarray([scalar_features(a, b) for a, b in zip(left_texts, right_texts)], dtype=np.float32)
    return np.column_stack([sparse_row_cosine(wx1, wx2), sparse_row_cosine(cx1, cx2), dense])


def best_threshold(y_true, scores) -> tuple[float, float]:
    candidates = np.linspace(0.05, 0.95, 181)
    values = [f1_score(y_true, scores >= t, zero_division=0) for t in candidates]
    best = int(np.argmax(values))
    return float(candidates[best]), float(values[best])


def binary_metrics(y_true, scores, threshold: float) -> dict:
    pred = scores >= threshold
    return {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_true, pred)),
        "precision": float(precision_score(y_true, pred, zero_division=0)),
        "recall": float(recall_score(y_true, pred, zero_division=0)),
        "f1": float(f1_score(y_true, pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, scores)),
        "pr_auc": float(average_precision_score(y_true, scores)),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--complaints", type=Path, default=ROOT / "data" / "complaints.csv")
    parser.add_argument("--pairs", type=Path, default=ROOT / "data" / "duplicate_pairs.csv")
    parser.add_argument("--models", type=Path, default=ROOT / "models")
    parser.add_argument("--results", type=Path, default=ROOT / "results")
    args = parser.parse_args()
    args.models.mkdir(parents=True, exist_ok=True)
    args.results.mkdir(parents=True, exist_ok=True)

    complaints = pd.read_csv(args.complaints)
    pairs = pd.read_csv(args.pairs)
    train_pairs = pairs[pairs.split == "train"]
    val_pairs = pairs[pairs.split == "val"]
    test_pairs = pairs[pairs.split == "test"]
    train_texts = complaints.loc[complaints.split == "train", "text"]
    word_vectorizer = TfidfVectorizer(
        analyzer="word", ngram_range=(1, 2), min_df=2, max_features=25000,
        sublinear_tf=True, strip_accents="unicode", dtype=np.float32,
    )
    char_vectorizer = TfidfVectorizer(
        analyzer="char_wb", ngram_range=(3, 5), min_df=2, max_features=35000,
        sublinear_tf=True, dtype=np.float32,
    )
    word_vectorizer.fit(train_texts)
    char_vectorizer.fit(train_texts)
    print("Extracting symmetric pair features...", flush=True)
    x_train = pair_features(train_pairs.left_text, train_pairs.right_text, word_vectorizer, char_vectorizer)
    x_val = pair_features(val_pairs.left_text, val_pairs.right_text, word_vectorizer, char_vectorizer)
    x_test = pair_features(test_pairs.left_text, test_pairs.right_text, word_vectorizer, char_vectorizer)
    pd.DataFrame(x_train, columns=FEATURE_NAMES).describe().to_csv(args.results / "duplicate_feature_summary.csv")

    candidates = {
        "majority": DummyClassifier(strategy="most_frequent"),
        "logistic_regression": LogisticRegression(C=1.0, max_iter=1000, class_weight="balanced", random_state=42),
        "random_forest": RandomForestClassifier(
            n_estimators=250, max_depth=12, min_samples_leaf=2,
            class_weight="balanced", random_state=42, n_jobs=2,
        ),
    }
    rows, fitted, val_details = [], {}, {}
    for name, model in candidates.items():
        model.fit(x_train, train_pairs.label)
        scores = model.predict_proba(x_val)[:, 1]
        threshold, val_f1 = best_threshold(val_pairs.label.to_numpy(), scores)
        detail = binary_metrics(val_pairs.label, scores, threshold)
        rows.append({"split": "val", "model": name, **detail})
        fitted[name], val_details[name] = model, detail
        print({"model": name, **detail}, flush=True)

    eligible = [x for x in rows if x["model"] != "majority"]
    selected = max(eligible, key=lambda x: x["f1"])
    name = selected["model"]
    model = fitted[name]
    val_scores = model.predict_proba(x_val)[:, 1]
    threshold, _ = best_threshold(val_pairs.label.to_numpy(), val_scores)
    test_scores = model.predict_proba(x_test)[:, 1]
    test_metric = binary_metrics(test_pairs.label, test_scores, threshold)
    rows.append({"split": "test", "model": name, **test_metric})
    majority_scores = fitted["majority"].predict_proba(x_test)[:, 1]
    rows.append({"split": "test", "model": "majority", **binary_metrics(test_pairs.label, majority_scores, 0.5)})
    pd.DataFrame(rows).to_csv(args.results / "duplicate_metrics.csv", index=False)

    test_output = test_pairs[["pair_id", "left_complaint_id", "right_complaint_id", "left_text", "right_text", "label", "pair_type", "language_relation", "shared_order_ref"]].copy()
    test_output["duplicate_probability"] = test_scores
    test_output["predicted_label"] = (test_scores >= threshold).astype(int)
    test_output["correct"] = test_output.label == test_output.predicted_label
    test_output.to_csv(args.results / "test_predictions_duplicate.csv", index=False)
    test_output[~test_output.correct].to_csv(args.results / "errors_duplicate.csv", index=False)

    breakdown = []
    for dimension in ["pair_type", "language_relation", "shared_order_ref"]:
        for value in test_pairs[dimension].unique():
            mask = (test_pairs[dimension] == value).to_numpy()
            if len(np.unique(test_pairs.label.to_numpy()[mask])) == 2:
                detail = binary_metrics(test_pairs.label.to_numpy()[mask], test_scores[mask], threshold)
            else:
                pred = (test_scores[mask] >= threshold).astype(int)
                detail = {
                    "threshold": threshold,
                    "accuracy": float(accuracy_score(test_pairs.label.to_numpy()[mask], pred)),
                    "precision": float(precision_score(test_pairs.label.to_numpy()[mask], pred, zero_division=0)),
                    "recall": float(recall_score(test_pairs.label.to_numpy()[mask], pred, zero_division=0)),
                    "f1": float(f1_score(test_pairs.label.to_numpy()[mask], pred, zero_division=0)),
                    "roc_auc": None, "pr_auc": None,
                }
            breakdown.append({"dimension": dimension, "value": value, "support": int(mask.sum()), **detail})
    pd.DataFrame(breakdown).to_csv(args.results / "duplicate_breakdowns.csv", index=False)

    importance = None
    if hasattr(model, "feature_importances_"):
        importance = dict(zip(FEATURE_NAMES, map(float, model.feature_importances_)))
        pd.DataFrame({"feature": FEATURE_NAMES, "importance": model.feature_importances_}).sort_values("importance", ascending=False).to_csv(args.results / "duplicate_feature_importance.csv", index=False)
    elif hasattr(model, "coef_"):
        importance = dict(zip(FEATURE_NAMES, map(float, model.coef_[0])))
        pd.DataFrame({"feature": FEATURE_NAMES, "coefficient": model.coef_[0]}).to_csv(args.results / "duplicate_feature_importance.csv", index=False)

    artifact = {
        "word_vectorizer": word_vectorizer, "char_vectorizer": char_vectorizer,
        "model": model, "threshold": threshold, "selected_model": name,
        "feature_names": FEATURE_NAMES,
    }
    joblib.dump(artifact, args.models / "duplicate.joblib", compress=3)
    summary = {
        "selection_rule": "highest validation F1 after validation-only threshold tuning",
        "selected_model": name, "test": test_metric, "feature_importance_or_coefficient": importance,
        "gold_metadata_used_as_features": False,
        "pair_features": FEATURE_NAMES,
    }
    (args.results / "duplicate_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    precision, recall, _ = precision_recall_curve(test_pairs.label, test_scores)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(recall, precision)
    ax.set(xlabel="Recall", ylabel="Precision", title="Duplicate detection: held-out test PR curve")
    ax.grid(alpha=0.25)
    fig.tight_layout()
    fig.savefig(args.results / "duplicate_precision_recall.png", dpi=160)
    plt.close(fig)
    print(f"Selected duplicate model: {name}; test={test_metric}", flush=True)


if __name__ == "__main__":
    main()
