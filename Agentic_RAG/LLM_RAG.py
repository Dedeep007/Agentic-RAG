import os
import base64
from google import genai
from google.genai import types
from retrieval_agent import RETAI
from master_agent import MASTERAI

class LLM_RAG:
    def __init__(self, api_key: str = None, worker_agents=None, max_loops=None, model: str = "gemini-2.0-flash"):

        self.mast = MASTERAI(api_key, worker_agents, max_loops)
        # Allow overriding via constructor or env var
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("API key must be provided either via parameter or GEMINI_API_KEY env var.")

        self.client = genai.Client(api_key=self.api_key)
        self.model = model

    def generate(self, prompt: str, safety_settings=None, response_mime_type: str = "text/plain") -> str:

        contents = [
            types.Content(
                role="user",
                parts=[ types.Part.from_text(text=prompt) ],
            )
        ]

        # Default safety settings if none provided
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

        output = []
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=config,
        ):
            output.append(chunk.text)

        return "".join(output)
        # Allow overriding via constructor or env var
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("API key must be provided either via parameter or GEMINI_API_KEY env var.")

        self.client = genai.Client(api_key=self.api_key)
        self.model = model

    def generate(self, prompt: str, safety_settings=None, response_mime_type: str = "text/plain") -> str:

        # print("MATER_Response: ", self.mast.generate(prompt))
        # print()

        contents = [
            types.Content(
                role="user",
                parts=[ types.Part.from_text(text=self.mast.generate(prompt)) ],
            )
        ]

        # Default safety settings if none provided
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

        output = []
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=config,
        ):
            output.append(chunk.text)

        return "".join(output)