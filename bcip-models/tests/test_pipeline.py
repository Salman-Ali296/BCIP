import unittest
from pathlib import Path
import joblib
import pandas as pd

from src.validate_data import validate
from src.predict import analyze
from src.train_duplicates import pair_features

ROOT = Path(__file__).resolve().parents[1]


class PipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.duplicate = joblib.load(ROOT / "models" / "duplicate.joblib")

    def test_dataset_integrity(self):
        report = validate()
        self.assertTrue(report["all_passed"], report)

    def test_english_inference_schema(self):
        result = analyze("My parcel is two weeks late and this is the third follow-up.")
        self.assertIn(result["category"], {"billing", "delivery", "product_quality", "customer_service", "technical_issue", "refund_return"})
        self.assertIn(result["sentiment"], {"neutral", "negative", "mixed"})
        self.assertIn(result["priority"], {"low", "medium", "high", "critical"})

    def test_urdu_inference(self):
        result = analyze("میرا پارسل ابھی تک نہیں ملا، براہ کرم اس کا جائزہ لیں۔")
        self.assertIsInstance(result["category"], str)
        self.assertNotEqual(result["category"], "")

    def test_empty_input_rejected(self):
        with self.assertRaises(ValueError):
            analyze("   ")

    def test_duplicate_output_and_symmetry(self):
        a = "My parcel PK-123456 is ten days late and I paid 2500 PKR."
        b = "The shipment for reference PK-123456 has not arrived; delay is ten days."
        ab = analyze(a, b)["duplicate"]
        ba = analyze(b, a)["duplicate"]
        self.assertAlmostEqual(ab["probability"], ba["probability"], places=6)
        self.assertIsInstance(ab["is_duplicate"], bool)

    def test_gold_metadata_not_used_in_duplicate_features(self):
        forbidden = {"label", "category", "incident_id", "split", "pair_type"}
        self.assertTrue(forbidden.isdisjoint(self.duplicate["feature_names"]))

    def test_challenge_set_is_disjoint(self):
        complaints = pd.read_csv(ROOT / "data" / "complaints.csv")
        challenge = pd.read_csv(ROOT / "data" / "challenge_complaints.csv")
        self.assertEqual(len(challenge), 180)
        self.assertFalse(set(challenge.text) & set(complaints.text))


if __name__ == "__main__":
    unittest.main()
