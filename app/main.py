# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.routes.analytics import router as analytics_router

app = FastAPI(title="Northstar Homes AI Agent")

# Allow Next.js frontend (localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # note: "*" ke saath credentials True nahi ho sakta
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}