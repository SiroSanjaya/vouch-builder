# Deployment Notes

This repository is currently configured for local execution. There is no public deployment URL in the current workspace yet.

## How to run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and add your `OPENAI_API_KEY` if you want the live model path.
3. Start the server:
   ```bash
   npm start
   ```
4. Call the API:
   ```bash
   curl -s -X POST http://localhost:3000/api/handover \
     -H "Content-Type: application/json" \
     -d '{}' | jq
   ```

## Notes on deployment

- The current server entrypoint is `server.js` and listens on port `3000`.
- The `vercel.json` file is present but the code is not currently structured as a Vercel serverless deployment.
- To deploy publicly, the service could be moved into a `api/` function folder for Vercel or containerized for a standard Node host.
- The service supports fallback `DEMO_HANDOVER` output when no API key is configured, so the endpoint remains usable for demo/test purposes.
