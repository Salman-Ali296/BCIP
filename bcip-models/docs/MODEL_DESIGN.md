# Model Design and Experimental Method

## 1. Scope

The FYP baseline implements four NLP components from the proposed platform:

| Component | Task type | Output |
|---|---|---|
| Complaint categorization | Six-class single-label classification | Primary complaint category |
| Sentiment analysis | Three-class single-label classification | Neutral, negative, or mixed |
| Priority detection | Four-class single-label classification | Low, medium, high, or critical |
| Duplicate detection | Balanced binary pair classification | Duplicate probability and thresholded decision |

Response suggestion, voice assistance, and complaint forecasting are excluded from this trained baseline to keep the FYP experimental scope manageable and measurable.

## 2. Processing architecture

```text
Raw complaint text
       |
       +--> TF-IDF + Linear SVC --> primary category
       |
       +--> TF-IDF + Linear SVC --> sentiment
       |
       +--> TF-IDF + Linear SVC --> priority
       |
Two complaint texts
       |
       +--> Symmetric pair features + Random Forest --> duplicate score
```

The three classifiers operate independently. They use raw text only and do not receive gold language, sector, category, incident, or structured-generation metadata. The duplicate detector consumes two raw texts and uses symmetric text-derived features.

## 3. Text representation

The shared classification representation combines:

- **Word TF-IDF:** unigrams and bigrams, minimum document frequency 2, sublinear term-frequency scaling, up to 30,000 features.
- **Character TF-IDF:** character n-grams from 3 to 5 within word boundaries, minimum document frequency 2, sublinear scaling, up to 40,000 features.

Character features are useful for spelling variation and Roman Urdu. Word features capture domain and cue phrases. The fitted vectorizer had 21,225 active features in the final run.

TF-IDF for document \(d\) and term \(t\) can be summarized as:

\[
\operatorname{tfidf}(t,d)=\operatorname{tf}(t,d)\times
\log\frac{1+N}{1+\operatorname{df}(t)}+1
\]

with subsequent normalization and the implementation's sublinear term-frequency transformation.

## 4. Classification candidates and selection

The same candidates were compared for category, sentiment, and priority:

1. Majority-class dummy baseline
2. Complement Naive Bayes
3. Linear Support Vector Classifier with balanced class weights
4. Logistic regression with balanced class weights

The selection metric was **validation macro F1**, which gives equal weight to each class. A deterministic tie preference favored Linear SVC, then logistic regression, then Complement NB. The test set was not used for selection.

Linear SVC optimizes a margin-based linear decision boundary. For a multi-class task, scikit-learn uses a one-versus-rest formulation. The saved models do not emit calibrated probabilities; inference therefore returns labels rather than misleading confidence percentages.

## 5. Duplicate-detection design

A positive pair means the same incident, not just the same topic. The pair classifier uses ten symmetric features:

1. Word TF-IDF cosine similarity
2. Character TF-IDF cosine similarity
3. Token Jaccard similarity
4. Token containment
5. Sequence-matcher ratio
6. Text-length ratio
7. Numeric-token Jaccard similarity
8. Whether both texts contain a reference
9. Whether the extracted references match
10. Whether both texts have the same Urdu-script presence

Candidates were a majority baseline, balanced logistic regression, and a class-balanced random forest. Validation F1 selected the model, and the decision threshold was tuned on validation predictions only. The final artifact uses the random forest and a threshold of approximately 0.42.

No gold category, incident ID, pair type, language-relation label, or split value is included as a predictive feature.

### Known design weakness

Number and reference features dominate the learned detector. This makes it useful for matching detailed repeat tickets but weak for purely semantic paraphrases with different or missing details. The ablation evaluation is therefore a required part of model assessment.

## 6. Data partitioning

The main corpus has 3,000 incident groups and two variants per group. The incidents are divided into 70% train, 15% validation, and 15% test, stratified by primary category. Both variants stay together.

This yields:

| Data | Train | Validation | Test |
|---|---:|---:|---:|
| Complaints | 4,200 | 900 | 900 |
| Duplicate pairs | 4,200 | 900 | 900 |

A separate 180-row template-held-out challenge set evaluates wording generalization. Duplicate ablations mask references and numbers without changing the validation-selected threshold.

## 7. Evaluation metrics

For multi-class classification:

- Accuracy
- Macro precision, recall, and F1
- Weighted F1
- Per-class precision, recall, F1, and support
- Confusion matrices
- Language, sector, and difficulty breakdowns
- Bootstrap 95% intervals for test macro F1

For duplicate detection:

- Accuracy, precision, recall, and F1
- ROC-AUC and average precision (PR-AUC)
- Threshold selected on validation data
- Pair-type, same/cross-language, and shared-reference breakdowns
- Reference and numeric-cue ablation

Macro F1 is primary because it prevents frequent classes from completely dominating model selection.

## 8. Testing strategy

The automated suite checks:

- Dataset schema and integrity
- Incident-level split isolation
- Exact-text uniqueness
- Pair label semantics and split consistency
- English and Urdu inference
- Empty-input rejection
- Duplicate-output schema and input-order symmetry
- Exclusion of gold metadata from pair features
- Challenge-set size and exact-text disjointness

These are software and experimental-integrity tests, not substitutes for human linguistic validation.

## 9. Transformer upgrade plan

The following is a **proposed future experiment**, not a result claimed in this package:

### Classification

Fine-tune a multilingual transformer such as `distilbert-base-multilingual-cased` or XLM-RoBERTa using the same incident-grouped splits. Use a maximum sequence length appropriate to the corpus, class-weighted loss where needed, a small learning rate such as 2e-5, early stopping on validation macro F1, and identical challenge evaluation. Compare against the CPU baselines using the same metrics.

### Semantic duplicates

Evaluate multilingual sentence embeddings, for example a multilingual MiniLM sentence transformer, using cosine similarity and a validation-selected threshold. Report results separately for same-language and cross-language pairs and for pairs without shared references or numbers. A supervised pair classifier can combine embedding cosine, absolute embedding difference, and element-wise embedding product.

### Required comparison rule

Do not replace a baseline because a transformer is newer or larger. Prefer it only if it improves the grouped test and challenge results without unacceptable inference cost, and document hardware, training time, and failed runs.

## 10. Deployment-oriented extension

For integration with the FYP web platform, expose the inference function through a small Python API. Store model version, prediction, threshold, and timestamp with each AI enrichment result. Add human override fields and audit changes. Critical priority and response suggestions should remain reviewable rather than fully automated.
