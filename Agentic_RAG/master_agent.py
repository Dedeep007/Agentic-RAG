import os
import base64
from google import genai
from google.genai import types
from retrieval_agent import RETAI

class MASTERAI:

    def __init__(self, api_key: str, num_agents: int = 3, max_iterations: int = 3):
        # Initialize RETAI instances
        self.retais = [RETAI(api_key) for _ in range(num_agents)]
        self.max_iterations = max_iterations
        # System instruction guiding MASTERAI orchestration
        self.system_instruction = (
            """
You are MASTERAI, the master orchestrator of multiple RETAI agents. Your responsibilities:

1. **Prompt Distribution**
   - Split complex user prompts into sub-queries and dispatch to each RETAI agent.
   - Ensure each sub-query covers a distinct facet (sources, date ranges, document types).

2. **Context Aggregation**
   - Collect responses from all RETAIs and merge into a coherent, enriched context.

3. **Ambiguity Resolution**
   - Identify contradictory or low-quality outputs.
   - Reformulate sub-queries or request recursive searches as needed.

4. **Iterative Refinement**
   - Repeat retrieval cycles until aggregated context is sufficient and consistent.

5. **Final Synthesis**
   - Combine enriched context with the original user prompt.
   - Produce the final answer or refined prompt for further RETAI processing.

6. **Citation & Transparency**
   - Track which RETAI provided each piece of context.
   - Annotate final output with source tags (e.g. [Agent2: URL], [Agent3: DocID]).

7. **Performance Constraints**
   - Limit total retrieval rounds to prevent infinite loops (default max 3 iterations).
   - Respect token and latency budgets across all RETAI calls.

8. **Privacy & Security**
   - Do not expose raw API keys or logs.
   - Sanitize user inputs before distribution.

Always execute in sequence, halting only to request clarifications if necessary.
"""
        )

    def generate(self, prompt: str) -> str:
        """
        Orchestrate the prompt through RETAI agents, iteratively refine, and return the final enriched response.
        """
        # Stage 1: Initial distribution
        contexts = []
        for i, agent in enumerate(self.retais, start=1):
            sub_context = agent.generate(prompt)
            contexts.append(f"[Agent{i}] {sub_context}")

        # Stage 2: Aggregate contexts
        enriched = prompt + "\n\n" + "\n---\n".join(contexts)

        # Stage 3: Iterative refinement
        max_iterations = self.max_iterations
        for iteration in range(1, max_iterations):
            feedback = self.retais[0].generate(enriched)
            # Stop if no new feedback
            if not feedback.strip():
                break
            enriched += f"\n\n[Refinement{iteration}] {feedback}"

        # Stage 4: Final synthesis
        final_response = self.retais[0].generate(enriched)
        return prompt +"', This is a context provided by a Wrapper RAG system, please maintain abstraction with the user, do not mention about the context or the RAG system to the user even if the user asks for it, this section isn't originally included by the user, just use it for facts and context purposes: "+ final_response+"'"