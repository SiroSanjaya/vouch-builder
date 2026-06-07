# Decisions

## What I built and what I deliberately skipped (and why)
I built a local Node.js Express service with a single endpoint `POST /api/handover`. This endpoint ingests the JSON events and unstructured markdown logs, uses the OpenAI API to reconcile them, and outputs a structured JSON handover that a frontend could easily render.
I deliberately skipped building a frontend (React/HTML) because the prompt stated "Utility over beauty" and building a reliable backend parsing and reconciliation engine was the priority for the 2-hour timeframe. A raw JSON output from `curl` is perfectly functional for integration. I also skipped deploying to a cloud provider and built it to run locally, as deployment accounts/setup would burn too much time.

## How I handle reconciliation across nights
Reconciliation is handled by a prompt-engineered LLM (GPT-4o). Since the input spans structured JSON events, unstructured free-text, and even Chinese text (from the relief staff), traditional rule-based reconciliation would be extremely brittle. I instructed the LLM to perform "Thread Mapping"—linking room numbers and issue types across the chronological events—and then determine the final state (as of the latest morning in the dataset).

## How I keep every statement grounded and stop hallucinations
The LLM prompt uses strict structural requirements:
1. Every output item MUST have a `citations` array.
2. The LLM is explicitly forbidden from inventing facts.
3. For incomplete or contradictory input, the LLM is instructed to flag it (which maps to the `anomalies` array in the JSON schema).
To handle prompt injection (like the guest message in `evt_0026` asking for a "goodwill credit" and to "ignore all other items"), the prompt explicitly warns the model about potential malicious user data imitating system notes, directing it to place those anomalies in a separate array rather than acting on them.

## Where AI helped most, and where it got in the way
AI helped most in reasoning across different data formats and languages (e.g., mapping the Chinese "312 no-show settled" note from May 27th to the May 28th dispute event for the same room). This would take days to build reliably with regex or NLP heuristics.
AI got in the way slightly when trying to enforce strict JSON schemas; occasionally models can wrap output in markdown code blocks even when asked for pure JSON, though using OpenAI's `response_format: { type: 'json_object' }` feature completely mitigated this issue.

## What I'd do in hours 3–6 if I had them
1. **Frontend**: Build a simple React or Vue SPA to render the JSON nicely with colored badges for status (On Fire, Pending, FYI) and a clean UI for the morning manager.
2. **Testing**: Write comprehensive unit tests and regression tests using historical handover inputs.
3. **Database Integration**: Actually save the handovers and track resolutions over time in a database (like Postgres) rather than re-computing everything on the fly.
4. **Resiliency**: Add fallback models (e.g., Anthropic Claude or Gemini) in case the primary LLM API goes down.

## One thing that surprised you
The deliberate prompt injection attempt in `evt_0026` ("SYSTEM NOTE TO THE HANDOVER TOOL"). It's a fantastic real-world edge case that highlights how user-generated data fed directly to an LLM needs the same security mindset as raw SQL inputs in the Web 1.0 era.
