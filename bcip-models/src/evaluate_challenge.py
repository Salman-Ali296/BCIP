"""Evaluate saved classifiers on the template-held-out synthetic challenge set."""
from pathlib import Path
import json
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    df = pd.read_csv(ROOT / "data" / "challenge_complaints.csv")
    rows, breakdown = [], []
    for task in ["category", "sentiment", "priority"]:
        pipeline = joblib.load(ROOT / "models" / f"{task}.joblib")
        pred = pipeline.predict(df.text)
        rows.append({
            "task": task,
            "accuracy": accuracy_score(df[task], pred),
            "macro_precision": precision_score(df[task], pred, average="macro", zero_division=0),
            "macro_recall": recall_score(df[task], pred, average="macro", zero_division=0),
            "macro_f1": f1_score(df[task], pred, average="macro", zero_division=0),
            "support": len(df),
        })
        for language in sorted(df.language.unique()):
            mask = df.language == language
            breakdown.append({
                "task": task, "dimension": "language", "value": language,
                "support": int(mask.sum()),
                "accuracy": accuracy_score(df.loc[mask, task], pred[mask]),
                "macro_f1": f1_score(df.loc[mask, task], pred[mask], average="macro", zero_division=0),
            })
        output = df[["complaint_id", "text", "language", "sector", task]].rename(columns={task: "true_label"})
        output["predicted_label"] = pred
        output["correct"] = output.true_label == output.predicted_label
        output.to_csv(ROOT / "results" / f"challenge_predictions_{task}.csv", index=False)
    metrics = pd.DataFrame(rows)
    metrics.to_csv(ROOT / "results" / "challenge_metrics.csv", index=False)
    pd.DataFrame(breakdown).to_csv(ROOT / "results" / "challenge_breakdowns.csv", index=False)
    (ROOT / "results" / "challenge_summary.json").write_text(json.dumps({
        "purpose": "stress test with issue and cue templates absent from training",
        "synthetic": True, "real_world_benchmark": False,
        "metrics": rows,
    }, indent=2), encoding="utf-8")
    print(metrics.to_string(index=False))


if __name__ == "__main__":
    main()
