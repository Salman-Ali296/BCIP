from typing import List, Optional

from pydantic import BaseModel, Field


class ComplaintAnalysisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10_000)
    locale: str = Field(default="en_PK", max_length=20)
    candidate_texts: List[str] = Field(default_factory=list, max_length=100)
    candidate_ids: List[str] = Field(default_factory=list, max_length=100)


class ComplaintAnalysisResponse(BaseModel):
    category: str
    priority_score: float = Field(ge=0, le=100)
    sentiment_score: float = Field(ge=-1, le=1)
    sentiment_label: str
    is_duplicate: bool
    duplicate_of: Optional[str] = None
    duplicate_similarity: Optional[float] = Field(default=None, ge=0, le=1)
