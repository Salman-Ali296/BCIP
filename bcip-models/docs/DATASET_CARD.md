# Dataset Card — Synthetic Multilingual Business Complaints

## 1. Dataset identity

- **Dataset:** Business Complaint Intelligence Platform synthetic complaint corpus
- **Version:** 1.0
- **Generation seed:** 42
- **Source:** Original programmatic generation for this FYP
- **Real customer data used:** No
- **Third-party complaint text used:** No
- **Human verification completed:** No
- **Label status:** Programmatic silver labels based on the supplied label schema

## 2. Purpose and intended use

The dataset supports reproducible FYP experiments for complaint categorization, sentiment analysis, priority detection, and pairwise duplicate detection. It is intended for model prototyping, software integration testing, and demonstrating an experimental methodology.

It is **not** intended to support claims about production accuracy, customer demographics, real complaint frequencies, or deployment safety. A real, ethically collected, human-annotated evaluation set is required for those claims.

## 3. Files and sizes

| File | Rows | Purpose |
|---|---:|---|
| `complaints.csv` | 6,000 | Main text classification corpus |
| `duplicate_pairs.csv` | 6,000 | Pairwise duplicate classification |
| `challenge_complaints.csv` | 180 | Template-held-out wording stress test |
| `annotation_review_sample.csv` | 300 | Blank human annotation/review template |
| `data_summary.json` | — | Machine-readable distribution summary |

The main corpus contains 3,000 underlying incidents and two complaint variants per incident. The duplicate-pair corpus contains 3,000 positive same-incident pairs and 3,000 negative different-incident pairs. Of the negatives, 2,400 are hard negatives from the same sector and primary category, and 600 are easier different-category negatives.

## 4. Main corpus distributions

| Dimension | Distribution |
|---|---|
| Language | English 2,000; Urdu 2,000; Roman Urdu 2,000 |
| Sector | 1,200 each for retail, food service, logistics, healthcare, education |
| Primary category | 1,000 each for billing, delivery, product quality, customer service, technical issue, refund/return |
| Sentiment | Negative 3,300; neutral 1,500; mixed 1,200 |
| Priority | Low 1,200; medium 1,800; high 1,800; critical 1,200 |
| Difficulty | Easy 3,600; noisy 1,500; implicit 900 |
| Secondary issue | Present in 1,500 complaints; absent in 4,500 |
| Split | Train 4,200; validation 900; test 900 |

The pair corpus has the same 70/15/15 split sizes: 4,200 training, 900 validation, and 900 test pairs. The 180-row challenge set is separate and is never used for fitting or model selection.

## 5. Labels

### Primary category

- `billing`
- `delivery`
- `product_quality`
- `customer_service`
- `technical_issue`
- `refund_return`

When a secondary issue is present, the **first reported issue is primary**. The secondary category is metadata only and is not supplied as a model feature.

### Sentiment

- `neutral`: factual request without strong emotional evaluation
- `negative`: dissatisfaction, frustration, disappointment, or anger
- `mixed`: appreciation and dissatisfaction in the same complaint

### Priority

- `low`: minor inconvenience without urgent risk
- `medium`: ongoing delay or moderate disruption
- `high`: repeated unresolved contact, significant loss, paid-service blockage, or same-day commitment
- `critical`: immediate safety, unauthorized-payment, essential-service outage, or legal/regulatory risk

The highest applicable severity rule determines priority. Emotional intensity alone does not make a complaint critical.

### Duplicate

- `1`: both texts describe the same underlying incident
- `0`: different incidents, even when the category and sector match

## 6. Generation methodology

For each incident, the generator samples a deterministic combination of sector, primary category, sentiment, priority, language pair, channel, reference availability, amount, delay, and repeat-contact count. Two complaint variants are then composed using different surface patterns.

Three difficulty conditions increase variation:

- **Easy:** standard explicit wording.
- **Noisy:** light, deterministic spelling variation in English and Roman Urdu without altering labels or reference IDs.
- **Implicit:** a factual opening replaces the stock emotional opening; sentiment remains inferable from the remaining wording.

Twenty-five percent of incidents include a clearly marked secondary issue. Exact text collisions are resolved by selecting alternate valid phrasings. No random identifier is inserted merely to force uniqueness.

The challenge set uses different issue and cue templates. It measures wording generalization rather than in-distribution performance.

## 7. Split and leakage controls

The split unit is the **incident**, not the complaint row. Both variants of an incident always remain in the same split. Duplicate pairs are constructed only from incidents assigned to that pair's split. Vectorizers are fitted on training text only. Model and threshold selection use validation data only.

These controls prevent direct paraphrase leakage but cannot remove **template-family leakage**: training and in-distribution test complaints still come from the same generation system. This is why the separate template-held-out challenge evaluation is necessary.

## 8. Column guide

Important complaint columns include:

- Identifiers: `complaint_id`, `incident_id`, `variant`
- Model input: `text`
- Labels: `category`, `sentiment`, `priority`
- Metadata: `language`, `sector`, `channel`, `difficulty`, `secondary_category`
- Synthetic incident details: `order_ref`, `reference_in_text`, `amount_pkr`, `delay_days`, `repeat_count`
- Split and provenance: `split`, `is_synthetic`, `generation_seed`
- Explanations: `sentiment_rationale`, `priority_rationale`

Only `text` is used by the three main classifiers. Gold labels, incident IDs, sector, language metadata, and structured incident details are not model inputs.

Important pair columns include the two raw texts, complaint and incident IDs, binary label, split, pair type, language relation, and shared-reference indicator. The last three are used for evaluation breakdowns, not as direct gold-metadata features.

## 9. Quality checks and review status

Automated validation checks required columns, unique IDs, two variants per incident, non-empty labels, exact text uniqueness, split isolation, balanced designed dimensions, positive/negative pair semantics, pair split consistency, and challenge disjointness.

These checks do not establish linguistic naturalness or annotation correctness. The project team should use the 300-row review sheet, obtain independent annotations, adjudicate disagreements, and report inter-annotator agreement. Urdu and Roman Urdu review should involve proficient speakers.

## 10. Ethical and research limitations

- Synthetic distributions are balanced by design and must not be interpreted as real complaint frequencies.
- Template wording can encode the labels too directly.
- Programmatic Urdu and Roman Urdu may contain unnatural phrasing or spelling conventions.
- Sector coverage is shallow and does not represent all SMB contexts.
- Single-label categorization simplifies real multi-issue complaints.
- Duplicate generation shares structured incident details, which can inflate pairwise performance.
- No evidence is provided for fairness across real customer groups or deployment contexts.
- No personal data, real customer consent, or third-party dataset license is involved in this synthetic release.

## 11. Recommended next dataset milestone

Collect a separate, anonymized, ethically approved real complaint set; remove personal and account information; annotate it using the supplied guide; measure agreement; and keep it entirely unseen until final evaluation. Until then, describe all results as **synthetic proof-of-concept results**.
