"""Command-line inference for all four trained baseline components."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import joblib
try:
    from .train_duplicates import pair_features
except ImportError:  # direct script execution
    from train_duplicates import pair_features

ROOT = Path(__file__).resolve().parents[1]


def analyze(text: str, compare_with: str | None = None, models_dir: Path = ROOT / "models") -> dict:
    if not text or not text.strip():
        raise ValueError("Complaint text cannot be empty")
    result = {"text": text, "model_type": "cpu_baseline"}
    for task in ["category", "sentiment", "priority"]:
        pipeline = joblib.load(models_dir / f"{task}.joblib")
        result[task] = str(pipeline.predict([text])[0])
    if compare_with is not None:
        artifact = joblib.load(models_dir / "duplicate.joblib")
        features = pair_features(
            [text], [compare_with], artifact["word_vectorizer"], artifact["char_vectorizer"],
        )
        probability = float(artifact["model"].predict_proba(features)[0, 1])
        result["duplicate"] = {
            "comparison_text": compare_with,
            "probability": probability,
            "threshold": float(artifact["threshold"]),
            "is_duplicate": bool(probability >= artifact["threshold"]),
        }
    result["disclaimer"] = "Trained on synthetic data; human review is required for consequential decisions."
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True, help="Complaint text")
    parser.add_argument("--compare-with", default=None, help="Optional second complaint for duplicate detection")
    args = parser.parse_args()
    print(json.dumps(analyze(args.text, args.compare_with), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
