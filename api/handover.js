const { generateHandover } = require('../services/llm');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // Return sample handover on GET for smoke testing
    try {
      const eventsPath = path.join(__dirname, '..', 'data', 'events.json');
      const nightLogsPath = path.join(__dirname, '..', 'data', 'night-logs.md');
      const eventsFile = await fs.readFile(eventsPath, 'utf-8');
      const nightLogs = await fs.readFile(nightLogsPath, 'utf-8');
      const events = JSON.parse(eventsFile);
      const handover = await generateHandover(events, nightLogs);
      return res.status(200).json(handover);
    } catch (err) {
      console.error('Vercel handover GET error:', err);
      return res.status(500).json({ error: 'Failed to generate sample handover.', detail: err.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    let { events, nightLogs } = body;

    if (!events || !nightLogs) {
      const eventsPath = path.join(__dirname, '..', 'data', 'events.json');
      const nightLogsPath = path.join(__dirname, '..', 'data', 'night-logs.md');
      const eventsFile = await fs.readFile(eventsPath, 'utf-8');
      events = JSON.parse(eventsFile);
      nightLogs = await fs.readFile(nightLogsPath, 'utf-8');
    }

    const handover = await generateHandover(events, nightLogs);
    return res.status(200).json(handover);
  } catch (err) {
    console.error('Vercel handover POST error:', err);
    return res.status(500).json({ error: 'An error occurred during handover generation.', detail: err.message });
  }
};