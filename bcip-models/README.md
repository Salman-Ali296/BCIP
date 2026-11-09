# Business Complaint Intelligence Platform — FYP AI Baseline

This repository contains the **design, synthetic datasets, trained baseline models, evaluation, tests, and FYP documentation** for four NLP components in the supplied project brief:

1. Complaint categorization
2. Sentiment analysis
3. Priority detection
4. Duplicate complaint detection

The implementation supports **English, Urdu script, and Roman Urdu** across retail, food service, logistics, healthcare, and education. It is reproducible on a CPU and does not require external model downloads.

## Important research status

- All complaints are **synthetic**. No real customer messages or personal data were used.
- Labels are **programmatically generated silver labels**, not human-verified gold labels.
- The included `data/annotation_review_sample.csv` is a blank team-review sheet for 300 stratified complaints.
- Perfect incident-held-out classification scores reflect template learnability, **not real-world readiness**.
- The separate challenge and ablation evaluations expose wording and numeric-cue weaknesses. Read `docs/EVALUATION_REPORT.md` before using results in an FYP report or presentation.
- The models are a research baseline. Human review is required before consequential complaint or escalation decisions.

## Included artifacts

| Path | Contents |
|---|---|
| `data/complaints.csv` | 6,000 complaints; 3,000 incidents with two variants each |
| `data/duplicate_pairs.csv` | 6,000 balanced pairs, including hard negatives |
| `data/challenge_complaints.csv` | 180 template-held-out synthetic complaints |
| `data/annotation_review_sample.csv` | 300 complaints with blank human-review fields |
| `data/data_summary.json` | Dataset counts and generation status |
| `configs/label_schema.json` | Machine-readable label definitions |
| `models/` | Four trained Joblib artifacts |
| `results/` | Metrics, predictions, errors, figures, logs, and validation output |
| `docs/` | Dataset card, annotation guide, model design, evaluation, and FYP methodology |
| `src/` | Generation, training, evaluation, validation, and inference code |
| `tests/` | Seven automated integrity and inference tests |

## Reproduce the complete pipeline

Python 3.10+ is recommended. From this directory:

```bash
pip install -r requirements.txt
python3 run_pipeline.py
```

The pipeline fixes the random seed at 42, regenerates the data, validates split isolation, trains candidates using only the training split, selects models using validation performance, evaluates the reserved test and challenge sets, and runs the tests.

Individual stages can also be run:

```bash
python3 src/generate_data.py
python3 src/generate_challenge.py
python3 src/validate_data.py
python3 src/train_models.py
python3 src/train_duplicates.py
python3 src/evaluate_challenge.py
python3 src/evaluate_duplicate_ablation.py
python3 src/make_figures.py
python3 -m unittest discover -s tests -v
```

## Inference

```bash
python3 src/predict.py --text "My parcel is ten days late and this is my third follow-up."
```

Pairwise duplicate detection:

```bash
python3 src/predict.py \
  --text "My parcel PK-123456 is ten days late and I paid 2500 PKR." \
  --compare-with "The shipment for PK-123456 has not arrived; the delay is ten days."
```

The output contains category, sentiment, priority, optional duplicate probability and decision, plus a synthetic-data disclaimer.

## Selected baselines

- **Category, sentiment, priority:** word and character TF-IDF with a Linear Support Vector Classifier. Candidates also included Complement Naive Bayes, logistic regression, and a majority baseline.
- **Duplicate detection:** symmetric word/character similarity, token, sequence, numeric, reference, length, and script features with a random forest classifier. Logistic regression and a majority baseline were also compared.

## FYP documentation

Start with:

1. `docs/MODEL_DESIGN.md` — architecture, algorithms, split policy, and transformer upgrade plan.
2. `docs/DATASET_CARD.md` — generation, schema, distributions, and limitations.
3. `docs/ANNOTATION_GUIDE.md` — label rules and recommended human-review process.
4. `docs/EVALUATION_REPORT.md` — actual results and critical interpretation.
5. `docs/FYP_METHODOLOGY.md` — adaptable methodology and results narrative.

Do not delete the challenge or ablation results when reporting the project; they are essential to an honest evaluation.
