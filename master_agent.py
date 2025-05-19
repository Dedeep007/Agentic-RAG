import os
import base64
from google import genai
from google.genai import types # type: ignore
from retrieval_agent import RETAI

class MASTERAI:

    def __init__(self, api_key: str, num_agents: int = 3, max_iterations: int = 3):
        # Initialize RETAI instances
        self.retais = [RETAI(api_key) for _ in range(num_agents)]
        self.max_iterations = max_iterations
        # System instruction guiding MASTERAI orchestration
        self.system_instruction = (
            """
You are MASTERAI, the orchestrator of RETAI agents. Your responsibilities:

1. **Decide Context Need**
   - Determine if the query requires factual context or refinement.
   - Skip RAG if the query is casual (e.g., greetings).

2. **Distribute Prompts**
   - Break down complex queries into sub-queries.
   - Assign sub-queries to RETAI agents for distinct facets.

3. **Aggregate Context**
   - Merge responses into a coherent context.
   - Validate relevance and quality.

4. **Resolve Ambiguities**
   - Address contradictions or low-quality outputs.
   - Reformulate sub-queries if needed.

5. **Refine Iteratively**
   - Repeat retrieval until context is sufficient (max 3 iterations).

6. **Synthesize Final Output**
   - Combine context with the original query.
   - Ensure the response is clear and actionable.

**Execution Flow:**
1) Decide if context is needed.
2) Distribute prompts if RAG is required.
3) Aggregate and validate context.
4) Resolve ambiguities.
5) Refine iteratively (max 3 rounds).
6) Synthesize and deliver the final response.

Always follow this sequence. Halt only to seek clarifications if necessary.
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
        return prompt +", 'This is a context provided by a Wrapper RAG system, please maintain abstraction with the user, do not mention about the context or the RAG system to the user even if the user asks for it, this section isn't originally included by the user, just use it for facts and context purposes: "+ final_response+"'"