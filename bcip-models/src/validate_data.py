"""Validate dataset schema, labels, pair construction, and split isolation."""
from __future__ import annotations
import json
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]


def validate(data_dir: Path = ROOT / "data") -> dict:
    complaints = pd.read_csv(data_dir / "complaints.csv", keep_default_na=False)
    pairs = pd.read_csv(data_dir / "duplicate_pairs.csv")
    checks = {}
    required = {
        "complaint_id", "incident_id", "variant", "text", "language", "sector",
        "category", "secondary_category", "difficulty", "sentiment", "priority",
        "split", "is_synthetic",
    }
    checks["required_columns"] = required.issubset(complaints.columns)
    checks["unique_complaint_ids"] = complaints.complaint_id.is_unique
    checks["two_variants_per_incident"] = bool((complaints.groupby("incident_id").size() == 2).all())
    checks["no_missing_required_text_or_labels"] = not bool(complaints[["text", "language", "sector", "category", "sentiment", "priority"]].replace("", pd.NA).isna().any().any())
    checks["no_exact_duplicate_text"] = not bool(complaints.text.duplicated().any())
    checks["synthetic_flag"] = bool(complaints.is_synthetic.all())
    split_counts = complaints.groupby("incident_id").split.nunique()
    checks["incident_split_isolation"] = bool((split_counts == 1).all())
    checks["expected_split_sizes"] = complaints.split.value_counts().to_dict() == {"train": 4200, "val": 900, "test": 900}
    checks["balanced_languages"] = complaints.language.nunique() == 3 and complaints.language.value_counts().nunique() == 1
    checks["balanced_categories"] = complaints.category.nunique() == 6 and complaints.category.value_counts().nunique() == 1
    checks["balanced_sectors"] = complaints.sector.nunique() == 5 and complaints.sector.value_counts().nunique() == 1

    positive = pairs[pairs.label == 1]
    negative = pairs[pairs.label == 0]
    checks["positive_pairs_same_incident"] = bool((positive.left_incident_id == positive.right_incident_id).all())
    checks["negative_pairs_different_incidents"] = bool((negative.left_incident_id != negative.right_incident_id).all())
    checks["balanced_pair_labels"] = pairs.label.value_counts().to_dict() == {0: 3000, 1: 3000}
    complaint_splits = complaints.set_index("complaint_id").split.to_dict()
    checks["pair_complaint_split_consistency"] = bool(all(
        complaint_splits[row.left_complaint_id] == row.split and complaint_splits[row.right_complaint_id] == row.split
        for row in pairs.itertuples()
    ))
    pair_incident_splits = pairs.groupby("pair_id").split.nunique()
    checks["unique_pair_ids"] = pairs.pair_id.is_unique and bool((pair_incident_splits == 1).all())

    challenge_path = data_dir / "challenge_complaints.csv"
    if challenge_path.exists():
        challenge = pd.read_csv(challenge_path)
        checks["challenge_size_180"] = len(challenge) == 180
        checks["challenge_text_disjoint"] = not bool(set(challenge.text) & set(complaints.text))
    report = {
        "all_passed": all(checks.values()),
        "checks": {k: bool(v) for k, v in checks.items()},
        "complaint_rows": len(complaints), "pair_rows": len(pairs),
        "note": "Automated integrity checks only; labels are not human-verified.",
    }
    return report


def main() -> None:
    report = validate()
    output = ROOT / "results" / "data_validation.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if not report["all_passed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
