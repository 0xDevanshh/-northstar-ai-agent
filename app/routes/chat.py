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
# Hour-first alternatives so "5:30 pm" captures the hour, not just "30 pm".
TIME_PATTERN = r"\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d{1,2}:\d{2}|morning|afternoon|evening|noon|midday)\b"
BOOKING_INTENT_PATTERN = r"(book|schedule|arrange|visit|site visit)"


def extract_booking_details(text: str):
    text_lower = text.lower()
    date_match = re.search(DATE_PATTERN, text_lower)
    time_match = re.search(TIME_PATTERN, text_lower)
    return (
        date_match.group(0) if date_match else None,
        time_match.group(0) if time_match else None,
    )


def build_booking_context(message: str) -> str:
    """
    Decide what the LLM is allowed to say about booking for this turn.

    Returns a SYSTEM NOTE string, or "" when the message shows no booking intent.
    A booking may only be described as confirmed when attempt_booking() actually
    returned "confirmed" — otherwise the note forbids confirming anything.
    """
    if not re.search(BOOKING_INTENT_PATTERN, message.lower()):
        return ""

    date, time = extract_booking_details(message)

    if date and time:
        result = attempt_booking(date, time)
        # TEMP DEBUG: proves attempt_booking() really ran in the backend.
        print(
            f"[BOOKING DEBUG] date={date!r} time={time!r} "
            f"attempt_booking_called=True status={result['status']!r}",
            flush=True,
        )
        if result["status"] == "confirmed":
            return (
                f"[SYSTEM NOTE: Booking system confirmed a site visit on {date} "
                f"at {time} for Project Northstar One, Sector 79, Gurugram. "
                f"Relay this confirmation clearly to the customer.]"
            )
        return (
            f"[SYSTEM NOTE: Booking system FAILED to confirm the slot on {date} "
            f"at {time}. Reason: {result['reason']}. Do NOT tell the customer the "
            f"visit is booked or confirmed. Apologize briefly, say plainly that you "
            f"could not confirm that slot, and offer to have the sales team call to "
            f"finalize instead.]"
        )

    # Intent detected, but details are incomplete -> booking was NEVER attempted.
    missing = []
    if not date:
        missing.append("date")
    if not time:
        missing.append("time")
    missing_text = " and ".join(missing)

    # TEMP DEBUG: attempt_booking() deliberately not called.
    print(
        f"[BOOKING DEBUG] date={date!r} time={time!r} "
        f"attempt_booking_called=False missing={missing_text!r}",
        flush=True,
    )

    return (
        f"[SYSTEM NOTE: Booking intent detected but the booking system was NOT "
        f"called because the {missing_text} is missing. No booking exists. "
        f"Do NOT confirm any booking. Do NOT say the visit is booked, confirmed, "
        f"scheduled, or locked in. Do NOT invent a date or time. Ask the customer "
        f"for the missing {missing_text} before proceeding, one question at a time.]"
    )


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = req.session_id
    if not session_id or not session_exists(session_id):
        session_id = create_session()

    add_message(session_id, "user", req.message)

    # Recomputed per request from this message only — no carry-over between turns
    # or sessions.
    booking_context = build_booking_context(req.message)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + get_history(session_id)
    if booking_context:
        messages.append({"role": "system", "content": booking_context})

    reply = get_llm_response(messages)
    add_message(session_id, "assistant", reply)

    return ChatResponse(session_id=session_id, reply=reply)
