import os
from google import genai
from google.genai import types  # type: ignore
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
        model: str = "gemini-2.0-flash",
        max_history: int = 10,
    ):
        self.mast = MASTERAI(api_key, worker_agents, max_loops)
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key must be provided via parameter or GEMINI_API_KEY env var."
            )
        self.client = genai.Client(api_key=self.api_key)
        self.model = model
        self.max_history = max_history
        self.chat_history = []
        self.system_instruction = types.Part.from_text(
            text="""
You are an expert assistant that answers questions with accuracy and relevance. You may refer to the provided context—delimited by `SUMMARY_START` and `SUMMARY_END`—to supply the most up‐to‐date information when it’s applicable.

Do NOT reference, reveal, or describe the context boundaries or their source; treat them as an opaque resource.

If a query falls outside the scope of the provided context, reply exactly:
“Sorry, I don’t have information on that.”

Maintain a concise, professional, and helpful tone at all times.
"""
        )

    def clear_history(self):
        self.chat_history.clear()

    def generate(
        self,
        prompt: str,
        safety_settings=None,
        response_mime_type: str = "text/plain",
    ) -> dict:
        try:
            # Step 1: Get wrapped context+summary from MASTERAI
            mast_response = self.mast.generate(prompt)
            # Step 2: Combine system instruction and summary into one user message
            system_text = (
                self.system_instruction.text +
                f"\nSUMMARY_START\n{mast_response}\nSUMMARY_END"
            )
            # Only user role is supported in contents for Gemini
            user_message = system_text
            # Add chat history (as user/assistant pairs)
            contents = []
            for entry in self.chat_history:
                contents.append(
                    types.Content(role=entry["role"], parts=[types.Part.from_text(text=entry["content"])]))
            # Add the new user message
            contents.append(
                types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))
            # Step 3: Configure safety and response format
            if safety_settings is None:
                safety_settings = [
                    types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="BLOCK_MEDIUM_AND_ABOVE",
                    ),
                    types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="BLOCK_MEDIUM_AND_ABOVE",
                    ),
                ]
            config = types.GenerateContentConfig(
                safety_settings=safety_settings,
                response_mime_type=response_mime_type,
            )
            # Step 4: Stream and collect LLM response
            response_chunks = []
            for chunk in self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=config,
            ):
                response_chunks.append(chunk.text)
            llm_response = "".join(response_chunks)
            # Step 5: Update chat history
            self.chat_history.append({"role": "user", "content": mast_response})
            self.chat_history.append({"role": "assistant", "content": llm_response})
            if len(self.chat_history) > 2 * self.max_history:
                self.chat_history = self.chat_history[-2 * self.max_history :]
            return {"mast_response": mast_response, "llm_response": llm_response, "rag_prompt": mast_response}
        except Exception as e:
            print(f"Error during LLM generation: {e}")
            return {"error": str(e)}