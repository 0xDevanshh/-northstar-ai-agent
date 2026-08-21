# app/routes/analytics.py

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.session_store import get_history
from app.services.llm_client import get_llm_response

router = APIRouter()

class AnalyticsRequest(BaseModel):
    session_id: str

ANALYTICS_PROMPT = """
Based on the conversation transcript below, extract structured analytics.
Respond ONLY with valid JSON, no other text, no markdown fences.

Fields to extract:
- budget_range: string or "not discussed"
- configuration_interest: "2BHK", "3BHK", "both", or "not discussed"
- purpose: "investment", "self-use", or "not discussed"
- interest_level: "hot", "warm", "cold"
- site_visit_status: "booked", "failed", "not_requested"
- follow_up_required: true or false
- follow_up_time: string or null
- opt_out: true or false
- language_used: "English", "Hindi", "Hinglish", or "mixed"
"""

@router.post("/analytics")
def get_analytics(req: AnalyticsRequest):
    history = get_history(req.session_id)
    transcript = "\n".join([f"{m['role']}: {m['content']}" for m in history])

    messages = [
        {"role": "system", "content": ANALYTICS_PROMPT},
        {"role": "user", "content": transcript},
    ]

    raw = get_llm_response(messages)
    return {"raw_analytics": raw}