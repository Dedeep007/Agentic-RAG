import os
import google.generativeai as genai
from retrieval_agent import RETAI
from master_agent import MASTERAI

class LLM_RAG:
    """
    Wrapper around Gemini API with RAG context from MASTERAI and chat-history support.
    """

    def __init__(
        self,
        api_key: str = None,
        worker_agents=None,
        max_loops: int = None,
        model_name: str = "gemini-1.5-flash-002",
        max_history: int = 10,
    ):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("API key must be provided via parameter or GEMINI_API_KEY env var.")

        genai.configure(api_key=self.api_key)

        self.generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config=self.generation_config,
            system_instruction="""
You are an expert assistant that answers questions with accuracy and relevance. You may refer to the provided context—delimited by `SUMMARY_START` and `SUMMARY_END`—to supply the most up‐to‐date information when it’s applicable.

Do NOT reference, reveal, or describe the context boundaries or their source; treat them as an opaque resource.

If a query falls outside the scope of the provided context, reply exactly:
“Sorry, I don’t have information on that.”

Maintain a concise, professional, and helpful tone at all times.
""",
        )

        self.chat_session = self.model.start_chat(history=[])
        self.max_history = max_history
        self.chat_history = []

    def clear_history(self):
        self.chat_history.clear()

    def generate(self, prompt: str) -> dict:
        self.chat_session.add_message(role="user", content=prompt)
        response = self.chat_session.generate_response()
        self.chat_history.append({"role": "user", "content": prompt})
        self.chat_history.append({"role": "assistant", "content": response})
        if len(self.chat_history) > 2 * self.max_history:
            self.chat_history = self.chat_history[-2 * self.max_history:]
        return {"response": response}