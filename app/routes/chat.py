# app/routes/chat.py

import re
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.session_store import (
    create_session, get_history, add_message, session_exists
)
from app.services.llm_client import get_llm_response
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.booking import attempt_booking

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str

class ChatResponse(BaseModel):
    session_id: str
    reply: str

DATE_PATTERN = r"\b(\d{1,2}[/\-]\d{1,2}(?:[/\-]\d{2,4})?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)\b"
TIME_PATTERN = r"\b(\d{1,2}\s?(am|pm)|morning|afternoon|evening|noon)\b"
BOOKING_INTENT_PATTERN = r"(book|schedule|arrange|visit|site visit)"


def extract_booking_details(text: str):
    text_lower = text.lower()
    date_match = re.search(DATE_PATTERN, text_lower)
    time_match = re.search(TIME_PATTERN, text_lower)
    return (
        date_match.group(0) if date_match else None,
        time_match.group(0) if time_match else None,
    )


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = req.session_id
    if not session_id or not session_exists(session_id):
        session_id = create_session()

    add_message(session_id, "user", req.message)

    # Check if this message looks like a booking attempt with date + time
    booking_context = ""
    if re.search(BOOKING_INTENT_PATTERN, req.message.lower()):
        date, time = extract_booking_details(req.message)
        if date and time:
            result = attempt_booking(date, time)
            if result["status"] == "confirmed":
                booking_context = (
                    f"[SYSTEM NOTE: Booking system confirmed a site visit on {date} "
                    f"at {time} for Project Northstar One, Sector 79, Gurugram. "
                    f"Relay this confirmation clearly to the customer.]"
                )
            else:
                booking_context = (
                    f"[SYSTEM NOTE: Booking system failed to confirm the slot on {date} "
                    f"at {time}. Reason: {result['reason']}. Apologize briefly and offer "
                    f"to have the sales team call to finalize instead.]"
                )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + get_history(session_id)
    if booking_context:
        messages.append({"role": "system", "content": booking_context})

    reply = get_llm_response(messages)
    add_message(session_id, "assistant", reply)

    return ChatResponse(session_id=session_id, reply=reply)