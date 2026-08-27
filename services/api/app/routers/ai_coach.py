from fastapi import APIRouter
from app.schemas.ai_coach import AICoachExtractRequest, AICoachExtractResponse
from app.services.ai_coach_service import mock_extract_youth_profile

router = APIRouter(prefix="/ai-coach", tags=["AI Coach"])


@router.post("/extract-profile", response_model=AICoachExtractResponse)
def extract_profile_from_chat(
    payload: AICoachExtractRequest,
):
    """
    Mock AI Coach endpoint.
    Accepts user conversational messages and extracts structured skills, interests,
    availability, qualifications, and location preferences without invoking live LLMs.
    """
    extracted = mock_extract_youth_profile(payload.message)
    return AICoachExtractResponse(
        extracted_profile=extracted,
        confidence_note="Simulated AI profile extraction completed.",
    )

