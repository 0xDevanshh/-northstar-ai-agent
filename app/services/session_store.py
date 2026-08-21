# app/services/session_store.py

from typing import Dict, List
import uuid

# In-memory store: {session_id: [{"role": ..., "content": ...}, ...]}
sessions: Dict[str, List[dict]] = {}

def create_session() -> str:
    session_id = str(uuid.uuid4())
    sessions[session_id] = []
    return session_id

def get_history(session_id: str) -> List[dict]:
    return sessions.get(session_id, [])

def add_message(session_id: str, role: str, content: str):
    if session_id not in sessions:
        sessions[session_id] = []
    sessions[session_id].append({"role": role, "content": content})

def session_exists(session_id: str) -> bool:
    return session_id in sessions