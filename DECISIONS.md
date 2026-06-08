# Decisions

## What I built and what I deliberately skipped (and why)
- Built a local Node.js Express service with `POST /api/handover` that accepts structured `events` plus unstructured `nightLogs`.
- Added a `GET /api/handover` smoke-test route to return bundled sample output from `data/events.json` and `data/night-logs.md`.
- Kept output strictly JSON with categories `on_fire`, `pending`, `fyi`, and `anomalies`.
- Skipped a full frontend and deployment to a public URL because this workspace is local and the highest-value work in the available time was fixing service behavior, grounding, and prompt safety.
- Skipped a database-backed historical reconciliation engine for now to keep the solution simple and focused on generating a trustworthy handover from the input.

## How I handle reconciliation across nights
- The service unifies structured events and free-text logs into a single reconciliation flow in `services/llm.js`.
- The LLM is instructed to map issue threads across nights and decide which items are still open, newly resolved, or new tonight.
- The logic is deliberately prompt-driven because the input contains messy multilingual free text and implicit issue relationships.
- The implementation is designed to generalize by relying on room IDs, issue type, and citations rather than hard-coded sample text.

## How I keep every statement grounded and handle incomplete/contradictory input
- The prompt requires every output item to include `citations` drawn from the source data.
- The model is explicitly forbidden from inventing facts.
- Any suspicious or contradictory input is routed into `anomalies` rather than being folded into normal recommendations.
- Prompt injection is handled by instructing the LLM to ignore fake system-style instructions inside user content and report them as anomalies. The sample data includes exactly this case in `evt_0026`.
- The service also has a fallback static `DEMO_HANDOVER` so it still returns valid JSON when no API key is configured or the model call fails.

## Where AI helped most and where it got in the way
- AI helped most in reconciling messy natural language logs with structured events, especially across multilingual text and ambiguous issue state.
- AI was less reliable at strict formatting and grounding, so the code protects the pipeline with explicit prompt rules, citation requirements, and JSON cleanup.

## What I'd do in hours 3–6 if I had them
1. Add a simple front-end or Slack/email renderer for the JSON handover.
2. Add persistent storage to track issue status across nights instead of recomputing from scratch.
3. Add automated tests for prompt behavior, demo fallback, and sample data.
4. Add a deployed public endpoint and CI validation for the API.

## One thing that surprised me
- The dataset includes an intentional prompt-injection edge case, which showed that operational hotel inputs can be adversarial. It reinforced the need to treat `nightLogs` as untrusted text and keep every statement tightly grounded in citations.
