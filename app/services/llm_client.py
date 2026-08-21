from groq import Groq
from app.config import GROQ_API_KEY, MODEL_NAME

client = Groq(api_key=GROQ_API_KEY)

def get_llm_response(messages: list) -> str:
    """
    messages: list of {"role": "system"/"user"/"assistant", "content": "..."}
    """
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.6,
        max_tokens=500,
    )
    return response.choices[0].message.content