import logging
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, List, Optional, Tuple, cast

logger = logging.getLogger(__name__)

CATEGORIES = [
    "BILLING",
    "DELIVERY",
    "PRODUCT_QUALITY",
    "CUSTOMER_SERVICE",
    "TECHNICAL_SUPPORT",
    "REFUND",
    "GENERAL",
]


@dataclass
class ModelBundle:
    embedder: Any = None
    sentiment: Any = None
    categorizer: Any = None


@lru_cache(maxsize=1)
def get_models() -> ModelBundle:
    if os.getenv("AI_DISABLE_MODELS", "false").lower() == "true":
        return ModelBundle()

    models = ModelBundle()
    pipeline_factory: Any = None
    try:
        from sentence_transformers import SentenceTransformer

        models.embedder = SentenceTransformer(
            os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        )
    except Exception as error:
        logger.warning(
            "Embedding model unavailable; duplicate detection is disabled: %s", error
        )

    try:
        from transformers import pipeline as transformers_pipeline

        pipeline_factory = cast(Any, transformers_pipeline)

        models.sentiment = pipeline_factory(
            "sentiment-analysis",
            model=os.getenv(
                "SENTIMENT_MODEL", "distilbert-base-uncased-finetuned-sst-2-english"
            ),
        )
    except Exception as error:
        logger.warning(
            "Sentiment model unavailable; heuristic sentiment will be used: %s", error
        )

    try:
        if pipeline_factory is None:
            from transformers import pipeline as transformers_pipeline

            pipeline_factory = cast(Any, transformers_pipeline)
        models.categorizer = pipeline_factory(
            "zero-shot-classification",
            model=os.getenv("CATEGORY_MODEL", "valhalla/distilbart-mnli-12-1"),
        )
    except Exception as error:
        logger.warning(
            "Category model unavailable; keyword categorization will be used: %s", error
        )

    return models


def analyze_text(
    text: str,
    candidate_texts: Optional[List[str]] = None,
    candidate_ids: Optional[List[str]] = None,
) -> dict:
    models = get_models()
    sentiment_score, sentiment_label = _sentiment(text, models.sentiment)
    category = _category(text, models.categorizer)
    priority_score = _priority(text, sentiment_score)
    is_duplicate, duplicate_of, similarity = _duplicate(
        text, candidate_texts or [], candidate_ids or [], models.embedder
    )

    return {
        "category": category,
        "priority_score": priority_score,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
        "is_duplicate": is_duplicate,
        "duplicate_of": duplicate_of,
        "duplicate_similarity": similarity,
    }


def _sentiment(text: str, model: Any) -> Tuple[float, str]:
    if model is not None:
        try:
            result = model(text[:512])[0]
            confidence = float(result["score"])
            if result["label"].upper() == "POSITIVE":
                return round(confidence, 4), "POSITIVE"
            return round(-confidence, 4), "NEGATIVE"
        except Exception:
            pass

    positive = {"good", "helpful", "happy", "resolved", "excellent", "thanks"}
    negative = {"bad", "angry", "failed", "broken", "late", "refund", "terrible"}
    words = set(re.findall(r"[a-z]+", text.lower()))
    score = (len(words & positive) - len(words & negative)) / max(len(words), 1)
    score = max(-1.0, min(1.0, score * 4))
    label = "POSITIVE" if score > 0.15 else "NEGATIVE" if score < -0.15 else "NEUTRAL"
    return round(score, 4), label


def _category(text: str, model: Any) -> str:
    if model is not None:
        try:
            result = model(text[:1024], CATEGORIES)
            return str(result["labels"][0]).upper()
        except Exception:
            pass

    lowered = text.lower()
    keyword_groups = {
        "BILLING": ("bill", "charged", "invoice", "payment"),
        "DELIVERY": ("delivery", "delivered", "shipment", "courier", "late"),
        "REFUND": ("refund", "return", "money back"),
        "TECHNICAL_SUPPORT": ("login", "error", "password", "crash", "technical"),
        "PRODUCT_QUALITY": ("damaged", "defective", "quality", "broken"),
        "CUSTOMER_SERVICE": ("agent", "support", "representative", "rude"),
    }
    for category, keywords in keyword_groups.items():
        if any(keyword in lowered for keyword in keywords):
            return category
    return "GENERAL"


def _priority(text: str, sentiment_score: float) -> float:
    score = 50.0
    lowered = text.lower()
    score += max(0.0, -sentiment_score) * 25.0
    if any(
        term in lowered
        for term in ("urgent", "immediately", "legal", "fraud", "unsafe")
    ):
        score += 25.0
    return round(max(0.0, min(100.0, score)), 2)


def _duplicate(
    text: str,
    candidates: List[str],
    candidate_ids: List[str],
    model: Any,
) -> Tuple[bool, Optional[str], Optional[float]]:
    if model is None or not candidates:
        return False, None, None
    try:
        embeddings = model.encode([text, *candidates], normalize_embeddings=True)
        similarities = [
            sum(
                float(left) * float(right)
                for left, right in zip(embedding, embeddings[0])
            )
            for embedding in embeddings[1:]
        ]
        best_index = max(range(len(similarities)), key=similarities.__getitem__)
        best_similarity = similarities[best_index]
        if best_similarity >= 0.82:
            duplicate_id = (
                candidate_ids[best_index] if best_index < len(candidate_ids) else None
            )
            return True, duplicate_id, round(best_similarity, 4)
    except Exception as error:
        logger.warning("Duplicate detection failed: %s", error)
    return False, None, None
