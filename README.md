# Northstar Homes AI Sales Agent

AI conversational agent for Project Northstar One (Sector 79, Gurugram) — built for the Huvo AI Forward Deployed Engineer assignment.

## Tech Stack
- Backend: FastAPI (Python)
- LLM: Groq API (Llama 3.3 70B) — chosen over paid APIs (Anthropic/OpenAI) for zero-cost access while maintaining strong multilingual reasoning
- Frontend: Next.js (App Router, TypeScript) + Tailwind + shadcn/ui
- Memory: In-memory session store (per session_id), no database needed for this scope

## Project Structure
northstar-ai-agent/       → FastAPI backend
  app/prompts/            → final system prompt
  app/routes/             → /chat and /analytics endpoints
  app/services/           → LLM client, session memory, booking simulation
  tests/test_cases.md     → test scenarios with actual bot outputs
northstar-frontend/       → Next.js chat UI

## How to Run

### Backend
cd northstar-ai-agent
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000

### Frontend
cd northstar-frontend
npm install
# .env.local already set to http://localhost:8000/api
npm run dev

Visit http://localhost:3000

## Key Assumptions
- Only the facts explicitly given (project name, location, configurations, starting prices) are treated as ground truth; the agent is designed to refuse/deflect on anything else rather than hallucinate.
- Site-visit booking is simulated with an 80/20 success/failure split via a backend function, to demonstrate both success and failure handling paths.
- Session memory is in-memory (per process) and resets on server restart — acceptable for this assignment's scope; production would use Redis or a DB.
- Language detection is handled entirely by the LLM via prompt instruction, not a separate language-detection library — kept simple per assignment scope.

## Known Limitations
- No persistent storage — conversations are lost on server restart.
- No real voice/telephony integration — prompt is designed to be voice-compatible (no markdown, short sentences) but this build only demonstrates the chat interface, as instructed.
- Booking system is simulated, not connected to a real CRM/calendar.
- Analytics extraction relies on the LLM returning valid JSON; no strict schema validation/retry layer added, kept simple per assignment scope.

## AI Tools Used
- Claude (Anthropic) — used for prompt design, code scaffolding, and architecture decisions.
- Claude Code / Cursor — used to generate the Next.js + shadcn frontend from a structured build prompt.
