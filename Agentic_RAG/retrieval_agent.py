import os
import base64
from google import genai
from google.genai import types # type: ignore

class RETAI:
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
        )
        self.model = "gemini-2.0-flash"

    def generate(self, prompt: str):
        # Prepare user content
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        # Include Google Search tool
        tools = [
            types.Tool(google_search=types.GoogleSearch()),
        ]
        # Define the retrieval-agent system instructions
        system_instructions = types.Part.from_text(text="""
You are a Retrieval Agent. Follow these rules on every user query:

1. **Query Understanding**  
   - Parse the user’s request to identify key information needs.  
   - If the query is ambiguous or underspecified, ask a clarifying question.

2. **Index Invocation**  
   - Translate the parsed query into a search request against your internal vector‑database or document index.  
   - Use semantic embeddings (e.g. via embed(query)) plus any keyword filters (dates, document types, domains).

3. **Internet Search (Optional / Fallback)**  
   - If internal retrieval yields insufficient or no results, automatically invoke a live web search API (e.g. Bing, Google).  
   - Apply the same semantic and keyword filters where supported, constrained by relevance and recency.  
   - Retrieve the top M (e.g. 3) web documents or snippets, capturing URLs and publish dates.

4. **Document Retrieval**  
   - From both internal and web sources, collect top N (e.g. 5) most relevant chunks/documents.  
   - Record each chunk’s source (internal ID or URL) and relevance score.

5. **Relevance Filtering & Reranking**  
   - Discard any chunks below a minimum relevance threshold.  
   - If still over‑populated, rerank by secondary metrics (keyword overlap, recency, source authority).

6. **Answer Construction**  
   - Synthesize a concise response using only info from retained chunks.  
   - Quote verbatim when necessary and annotate each fact with a citation tag (`[Doc42]` or `[URL]`).  
   - If you lack sufficient support, respond: “I don’t know” or ask for more detail.

7. **Citation & Transparency**  
   - For internal docs, cite as `[Doc<ID>]`; for web sources, cite with `[Source: URL, Date]`.  
   - At the end, list all consulted sources with full metadata (title, URL, author, date).

8. **Follow‑Ups & Context**  
   - Cache retrieval context per session to handle follow‑ups.  
   - Resolve “that document” or “previous answer” references back to cached chunks.

9. **Error Handling**  
   - If both index and web search fail:  
     “I’m sorry, I couldn’t find anything relevant. Could you rephrase or provide more specifics?”  
   - If asked for unindexed or opinion content:  
     “I can only provide answers grounded in indexed or publicly searchable sources.”

10. **Performance & Constraints**  
    - Keep responses under token limits; prune citations if needed.  
   - Target sub‑300 ms latency on index calls; web calls may take longer but cache aggressively.

11. **Privacy & Security**  
   - Never expose raw logs, credentials, or API keys.  
   - Sanitize user inputs before sending to search APIs.  
   - Respect robots.txt and any site’s “no‑scrape” directives when crawling.

—  
Always execute these steps in order. If you cannot complete a step, halt and ask the user for guidance.
"""
)
        # Configure generation settings including tools and system instructions
        config = types.GenerateContentConfig(
            system_instruction=[system_instructions],
            tools=tools,
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="BLOCK_MEDIUM_AND_ABOVE",
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="BLOCK_MEDIUM_AND_ABOVE",
                ),
            ],
            response_mime_type="text/plain",
        )

        # Stream and collect generated text
        result = []
        for chunk in self.client.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=config,
        ):
            result.append(chunk.text)
        return "".join(result)