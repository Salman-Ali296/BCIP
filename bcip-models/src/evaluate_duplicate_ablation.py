"""Stress-test duplicate detection after removing reference and numeric cues."""
from pathlib import Path
import json
import re
import joblib
import pandas as pd
from train_duplicates import pair_features, binary_metrics

ROOT = Path(__file__).resolve().parents[1]


def mask_references(text: str) -> str:
    return re.sub(r"\bPK-\d{6}\b", "", str(text), flags=re.IGNORECASE)


def mask_numbers(text: str) -> str:
    return re.sub(r"\b\d+(?:\.\d+)?\b", "", mask_references(text))


def main() -> None:
    pairs = pd.read_csv(ROOT / "data" / "duplicate_pairs.csv")
    test = pairs[pairs.split == "test"].reset_index(drop=True)
    artifact = joblib.load(ROOT / "models" / "duplicate.joblib")
    conditions = {
        "original": (test.left_text.tolist(), test.right_text.tolist()),
        "references_masked": (
            [mask_references(x) for x in test.left_text],
            [mask_references(x) for x in test.right_text],
        ),
        "references_and_numbers_masked": (
            [mask_numbers(x) for x in test.left_text],
            [mask_numbers(x) for x in test.right_text],
        ),
    }
    rows = []
    for name, (left, right) in conditions.items():
        features = pair_features(left, right, artifact["word_vectorizer"], artifact["char_vectorizer"])
        scores = artifact["model"].predict_proba(features)[:, 1]
        rows.append({"condition": name, **binary_metrics(test.label, scores, artifact["threshold"])})
    output = pd.DataFrame(rows)
    output.to_csv(ROOT / "results" / "duplicate_ablation.csv", index=False)
    (ROOT / "results" / "duplicate_ablation.json").write_text(json.dumps({
        "purpose": "measure dependence on shared references and numeric details",
        "threshold_fixed_from_validation": True, "metrics": rows,
    }, indent=2), encoding="utf-8")
    print(output.to_string(index=False))


if __name__ == "__main__":
    main()
