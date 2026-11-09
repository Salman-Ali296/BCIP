# Complaint Annotation and Human-Review Guide

## 1. Annotation unit

Annotate the complaint text as provided. Do not use `incident_id`, `split`, generation attributes, or another complaint's gold label to choose a label. For duplicate review, read both texts together and decide whether they describe the same incident.

The supplied synthetic labels are **silver labels**. A reviewer should record independent judgments in the blank `human_*` columns rather than automatically copying the generated values.

## 2. Primary category

Choose the category of the **first/main reported issue**.

| Label | Include | Do not use merely because |
|---|---|---|
| `billing` | Incorrect, unexplained, duplicate, or disputed charges and payment records | A refund amount is mentioned; that may be `refund_return` |
| `delivery` | Late, missing, stalled, or unfulfilled delivery of an item, report, parcel, or material | A product is damaged; that may be `product_quality` |
| `product_quality` | Damage, defect, missing parts, poor quality, or mismatch with description | Delivery is also late; choose the first/main issue |
| `customer_service` | Rudeness, dismissal, unhelpful behavior, or unprofessional staff conduct | Service is slow without staff-behavior evidence |
| `technical_issue` | Portal, app, login, tracking, or software malfunction | A delivery status is merely not changing without a software fault |
| `refund_return` | Return acceptance, return processing, or a pending/promised refund | The complaint only disputes the original bill |

For genuinely multi-issue complaints, retain the main label and record the other issue in review notes. A future multi-label extension should use a separate schema rather than silently changing these labels.

## 3. Sentiment

- **Neutral:** The writer primarily states facts and requests action without a clear positive or negative evaluation.
- **Negative:** The writer expresses frustration, disappointment, anger, dissatisfaction, lost trust, or a comparable negative evaluation.
- **Mixed:** The writer includes both genuine appreciation and dissatisfaction about the experience.

Rules:

1. A complaint is not automatically negative merely because it reports a defect or delay.
2. Polite wording can still be negative if dissatisfaction is explicit.
3. Mixed requires both poles; a generic greeting or “thank you” alone should be interpreted cautiously.
4. Priority and sentiment are different. A calm safety complaint can be neutral and critical.

## 4. Priority

Apply the highest applicable level:

| Label | Decision rule | Typical evidence |
|---|---|---|
| `critical` | Immediate action is needed to address serious harm, security, essential-service, or legal/regulatory risk | Safety hazard, unauthorized account/payment use, multi-customer essential outage, urgent formal reporting |
| `high` | Serious operational or customer impact, but no immediate critical risk | Repeated unresolved complaints, significant loss, paid service blocked, important same-day commitment |
| `medium` | A normal service issue requires timely but non-emergency handling | Ongoing delay, moderate disruption, resolution expected within days |
| `low` | Minor issue with no urgent deadline or serious impact | Limited inconvenience, flexible resolution window |

Do not infer critical priority from insults, capitalization, or negative sentiment alone. Conversely, a factual and polite message can still be critical.

## 5. Duplicate decision

Mark `1` only when both complaints refer to the **same underlying incident or ticket**. Matching references, amounts, dates, product, and detailed circumstances can support this decision.

Mark `0` when they are separate incidents, even if:

- both concern late delivery;
- both belong to the same business and category;
- the wording is similar;
- the same customer has repeated a general problem at different times.

A recurring issue is not automatically a duplicate. For example, two different late parcels are a recurring delivery problem but separate incidents.

## 6. Review workflow recommended for the FYP

1. Create written reviewer instructions from this guide.
2. Have at least two reviewers independently label the same sample.
3. Hide generated labels during the first independent pass if measuring agreement with unbiased human judgments.
4. Resolve disagreements through discussion or a third adjudicator.
5. Record reviewer IDs and short reasons for difficult cases.
6. Report raw agreement and an appropriate agreement statistic, such as Cohen's kappa for two annotators on categorical labels.
7. Keep a frozen, human-verified test set separate from any data used to improve templates or models.

The current package does **not** claim that these steps have already been completed.

## 7. Review-sheet fields

`data/annotation_review_sample.csv` contains 300 complaints, sampled 50 per primary category, with these blank fields:

- `human_category_label`
- `human_sentiment_label`
- `human_priority_label`
- `reviewer_id`
- `review_notes`

Preserve the original generated columns for later agreement and error analysis. Do not overwrite them with human labels.

## 8. Quality and safety notes

Review Urdu and Roman Urdu for naturalness as well as label correctness. Remove or mask names, telephone numbers, addresses, account details, and other identifiers before introducing any real complaint text. Obtain the required consent or ethical approval for real-data collection.
