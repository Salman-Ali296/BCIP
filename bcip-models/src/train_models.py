"""Train and evaluate complaint category, sentiment, and priority classifiers.

Model selection uses validation macro-F1 only. The held-out test set is evaluated
after selection. All vectorizers are fitted on training text only.
"""
from __future__ import annotations

import argparse
import copy
import json
import time
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, f1_score,
    precision_recall_fscore_support, precision_score, recall_score,
)
from sklearn.naive_bayes import ComplementNB
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression

ROOT = Path(__file__).resolve().parents[1]
TASKS = ["category", "sentiment", "priority"]


def build_vectorizer() -> FeatureUnion:
    return FeatureUnion([
        ("word", TfidfVectorizer(
            analyzer="word", ngram_range=(1, 2), min_df=2, max_df=0.995,
            max_features=30000, sublinear_tf=True, strip_accents="unicode",
            dtype=np.float32,
        )),
        ("char", TfidfVectorizer(
            analyzer="char_wb", ngram_range=(3, 5), min_df=2,
            max_features=40000, sublinear_tf=True, dtype=np.float32,
        )),
    ])


def candidates() -> dict:
    return {
        "majority": DummyClassifier(strategy="most_frequent"),
        "complement_nb": ComplementNB(alpha=0.5),
        "linear_svc": LinearSVC(C=1.0, class_weight="balanced", random_state=42),
        "logistic_regression": LogisticRegression(
            C=2.0, class_weight="balanced", solver="lbfgs", max_iter=400,
            random_state=42,
        ),
    }


def metrics(y_true, y_pred) -> dict:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "macro_precision": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "macro_recall": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "macro_f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "weighted_f1": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
    }


def bootstrap_macro_f1(y_true, y_pred, n_boot: int = 500) -> list[float]:
    rng = np.random.default_rng(42)
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    scores = []
    for _ in range(n_boot):
        idx = rng.integers(0, len(y_true), len(y_true))
        scores.append(f1_score(y_true[idx], y_pred[idx], average="macro", zero_division=0))
    return [float(np.percentile(scores, 2.5)), float(np.percentile(scores, 97.5))]


def save_confusion(y_true, y_pred, labels, task: str, output: Path) -> None:
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(labels)), labels, rotation=35, ha="right")
    ax.set_yticks(range(len(labels)), labels)
    ax.set_xlabel("Predicted label")
    ax.set_ylabel("True label")
    ax.set_title(f"Held-out test confusion matrix: {task}")
    for i in range(len(labels)):
        for j in range(len(labels)):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center", fontsize=9)
    fig.colorbar(im, ax=ax, fraction=0.046)
    fig.tight_layout()
    fig.savefig(output / f"confusion_{task}.png", dpi=160)
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=ROOT / "data" / "complaints.csv")
    parser.add_argument("--models", type=Path, default=ROOT / "models")
    parser.add_argument("--results", type=Path, default=ROOT / "results")
    args = parser.parse_args()
    args.models.mkdir(parents=True, exist_ok=True)
    args.results.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(args.data)
    train = df[df.split == "train"]
    val = df[df.split == "val"]
    test = df[df.split == "test"]
    print(f"Fitting shared TF-IDF on {len(train)} training complaints...", flush=True)
    vectorizer = build_vectorizer()
    x_train = vectorizer.fit_transform(train.text)
    x_val = vectorizer.transform(val.text)
    x_test = vectorizer.transform(test.text)
    print(f"Feature matrix: {x_train.shape}", flush=True)

    all_metrics, per_class_rows, breakdown_rows = [], [], []
    summary = {"selection_rule": "highest validation macro_f1", "test_used_for_selection": False, "tasks": {}}

    for task in TASKS:
        y_train, y_val, y_test = train[task], val[task], test[task]
        labels = sorted(df[task].unique().tolist())
        fitted, val_predictions = {}, {}
        for name, model in candidates().items():
            start = time.time()
            estimator = clone(model)
            estimator.fit(x_train, y_train)
            pred_val = estimator.predict(x_val)
            row = {"task": task, "split": "val", "model": name, "seconds": round(time.time() - start, 3), **metrics(y_val, pred_val)}
            all_metrics.append(row)
            print(row, flush=True)
            fitted[name] = estimator
            val_predictions[name] = pred_val

        val_rows = [r for r in all_metrics if r["task"] == task and r["split"] == "val" and r["model"] != "majority"]
        tie_preference = {"linear_svc": 3, "logistic_regression": 2, "complement_nb": 1}
        best_name = max(val_rows, key=lambda r: (r["macro_f1"], tie_preference[r["model"]]))["model"]
        best = fitted[best_name]
        pred_test = best.predict(x_test)
        test_metric = {"task": task, "split": "test", "model": best_name, **metrics(y_test, pred_test)}
        all_metrics.append(test_metric)
        majority_test = fitted["majority"].predict(x_test)
        all_metrics.append({"task": task, "split": "test", "model": "majority", **metrics(y_test, majority_test)})
        ci = bootstrap_macro_f1(y_test, pred_test)
        summary["tasks"][task] = {
            "selected_model": best_name,
            "validation_macro_f1": float(max(val_rows, key=lambda r: r["macro_f1"])["macro_f1"]),
            "test": test_metric,
            "test_macro_f1_95pct_bootstrap_ci": ci,
            "labels": labels,
            "probability_output": False,
        }

        report = classification_report(y_test, pred_test, labels=labels, output_dict=True, zero_division=0)
        for label in labels:
            per_class_rows.append({
                "task": task, "label": label,
                "precision": report[label]["precision"], "recall": report[label]["recall"],
                "f1": report[label]["f1-score"], "support": report[label]["support"],
            })
        for dimension in ["language", "sector", "difficulty"]:
            for value in sorted(test[dimension].unique()):
                mask = test[dimension] == value
                breakdown_rows.append({
                    "task": task, "dimension": dimension, "value": value,
                    "support": int(mask.sum()), **metrics(y_test[mask], pred_test[mask]),
                })

        prediction_rows = test[["complaint_id", "incident_id", "text", "language", "sector", task]].copy()
        prediction_rows = prediction_rows.rename(columns={task: "true_label"})
        prediction_rows["predicted_label"] = pred_test
        prediction_rows["correct"] = prediction_rows.true_label == prediction_rows.predicted_label
        prediction_rows.to_csv(args.results / f"test_predictions_{task}.csv", index=False)
        prediction_rows[~prediction_rows.correct].to_csv(args.results / f"errors_{task}.csv", index=False)
        save_confusion(y_test, pred_test, labels, task, args.results)

        pipeline = Pipeline([("tfidf", copy.deepcopy(vectorizer)), ("classifier", best)])
        joblib.dump(pipeline, args.models / f"{task}.joblib", compress=3)
        print(f"Selected {task}: {best_name}; test={test_metric}", flush=True)

    pd.DataFrame(all_metrics).to_csv(args.results / "classification_metrics.csv", index=False)
    pd.DataFrame(per_class_rows).to_csv(args.results / "per_class_metrics.csv", index=False)
    pd.DataFrame(breakdown_rows).to_csv(args.results / "classification_breakdowns.csv", index=False)
    (args.results / "classification_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
