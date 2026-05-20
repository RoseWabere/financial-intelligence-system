from fastapi import APIRouter

from app.schemas.schemas import RecommendationResponse, UserProfile
from app.services.decision_engine import recommend

router = APIRouter(prefix="/api/recommendation", tags=["recommendation"])


@router.post("", response_model=RecommendationResponse)
async def get_recommendation(profile: UserProfile) -> RecommendationResponse:
    """
    POST a user profile → receive a rule-based investment allocation plan.

    Example request:
    ```json
    {
      "income_kes_monthly": 50000,
      "risk": "medium",
      "goals": ["education", "house"],
      "horizon_years": 5,
      "age": 30,
      "has_debt": false
    }
    ```
    """
    return recommend(profile)
