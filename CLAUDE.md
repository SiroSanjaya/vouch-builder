# CLAUDE.md

This repository is built around an LLM-backed handover generator. We support OpenAI and local Ollama/Gemini flows in `services/llm.js`; this file documents how to adapt the service if using Anthropic Claude.

## Purpose

- Document a Claude-compatible integration path.
- Make it clear that model choice is separate from the grounding, citation, and prompt-safety strategy.

## Suggested Claude integration

Use a provider-specific client in `services/llm.js` and keep the same input/output contract as other providers:

- `events` and `nightLogs` are passed into the prompt as structured user data.
- The model must return valid JSON with `on_fire`, `pending`, `fyi`, and `anomalies`.
- Every item must include a `citations` array.

## Example adapter

```js
const { AnthropicClient } = require('@anthropic-ai/sdk');
const client = new AnthropicClient({ apiKey: process.env.CLAUDE_API_KEY });

async function callClaude(events, nightLogs) {
  const prompt = SYSTEM_PROMPT + '\n\n' + buildUserPrompt(events, nightLogs);
  const response = await client.responses.create({
    model: 'claude-3.5',
    input: prompt,
    max_output_tokens: 1200,
    temperature: 0.1
  });
  return parseJsonResponse(response.output_text);
}
```

## Safety and grounding rules

- Wrap the input data in explicit delimiters (`<events>` and `<night_logs>`).
- Tell Claude to ignore any embedded system-like instructions in the user-provided data.
- Require citations on every output item.
- Flag contradictory or suspicious input in `anomalies` instead of acting on it.
- Use a low temperature (`0.1`) to reduce creative hallucination.

## Why this file exists

This file satisfies the repository deliverable for `CLAUDE.md` and helps future reviewers understand how a Claude integration would fit the same architecture.
