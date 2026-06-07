# Vouch Handover Service

A Node.js service that generates action-first night-shift handover reports for hotel morning managers. It ingests structured JSON events and unstructured free-text logs, reconciles them across multiple nights using an LLM, and returns structured JSON that a morning manager can act on within 60 seconds.

## Setup

### Prerequisites
- Node.js 18+
- An OpenAI API key (`gpt-4o` access recommended)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Running

```bash
npm start
```

The server starts on port 3000 by default.

## Usage

### Generate a handover using the bundled sample data

**Linux/macOS (bash):**
```bash
curl -s -X POST http://localhost:3000/api/handover \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/handover" -Method POST -ContentType "application/json" -Body "{}" | ConvertTo-Json -Depth 10
```

> **No API key yet?** The service auto-detects a missing `OPENAI_API_KEY` and returns a pre-computed realistic demo handover so you can verify the service end-to-end without any credentials.

### Generate a handover by providing your own data

```bash
curl -s -X POST http://localhost:3000/api/handover \
  -H "Content-Type: application/json" \
  -d '{
    "events": {
      "hotel": { "id": "my-hotel", "name": "My Hotel", "timezone": "+08:00" },
      "events": [
        {
          "id": "evt_001",
          "timestamp": "2026-05-26T01:00:00+08:00",
          "type": "maintenance",
          "room": "112",
          "guest": "John Doe",
          "description": "Aircon not working. Guest moved to 115.",
          "status": "unresolved"
        }
      ]
    },
    "nightLogs": "Quiet night. One issue with room 112 aircon, already handled by moving the guest."
  }' | jq
```

## API Reference

### `POST /api/handover`

**Request body:**
| Field | Type | Description |
|---|---|---|
| `events` | object | Structured events JSON (see `data/events.json` for shape). If omitted, loads from `data/events.json`. |
| `nightLogs` | string | Unstructured night log text. If omitted, loads from `data/night-logs.md`. |

**Response:** JSON object:
```json
{
  "on_fire": [
    {
      "title": "Unresolved deposit — Room 309",
      "description": "SGD 100 deposit for Jaydeep Suthkumar was never collected...",
      "citations": ["evt_0007", "night-log-27-May", "evt_0014"],
      "status": "Still open"
    }
  ],
  "pending": [...],
  "fyi": [...],
  "anomalies": [
    {
      "description": "Potential prompt injection attempt: guest note in room 214 contained fake system instructions requesting to 'ignore all items' and add a SGD 1000 goodwill credit.",
      "citations": ["evt_0026"]
    }
  ]
}
```

## Project Structure

```
.
├── server.js           # Express server & API endpoint
├── services/
│   └── llm.js          # LLM integration and prompt engineering
├── data/
│   ├── events.json     # Sample structured events
│   └── night-logs.md   # Sample unstructured night log
├── AGENTS.md           # Instructions for AI agents and contributors
├── DECISIONS.md        # Key design decisions and tradeoffs
└── .env.example        # Environment variable template
```

## Structured Logging

All logs are emitted as JSON via `pino`. Each handover generation emits:
- `generate_handover_start` — hotel ID, timestamp
- `generate_handover_success` — hotel ID, timestamp
- `generate_handover_error` — error message

To debug a bad handover, search logs by `hotel` ID and `night` timestamp.

