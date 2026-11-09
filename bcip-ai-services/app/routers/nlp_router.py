from fastapi import APIRouter

from app.schemas.nlp_schemas import ComplaintAnalysisRequest, ComplaintAnalysisResponse
from app.services.nlp import analyze_text

router = APIRouter()


@router.post("/analyze", response_model=ComplaintAnalysisResponse)
async def analyze_complaint(
    request: ComplaintAnalysisRequest,
) -> ComplaintAnalysisResponse:
    result = analyze_text(
        request.text,
        request.candidate_texts,
        request.candidate_ids,
    )
    return ComplaintAnalysisResponse(**result)
