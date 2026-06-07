require('dotenv').config();
const express = require('express');
const pino = require('pino');
const fs = require('fs/promises');
const path = require('path');
const { generateHandover } = require('./services/llm');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const app = express();
app.use(express.json());

// Main endpoint for handover generation
app.post('/api/handover', async (req, res) => {
  try {
    let events = req.body.events;
    let nightLogs = req.body.nightLogs;

    // Fallback to local files if not provided in the request
    if (!events || !nightLogs) {
      logger.info('No data provided in request body, falling back to local files in /data');
      const eventsPath = path.join(__dirname, 'data', 'events.json');
      const nightLogsPath = path.join(__dirname, 'data', 'night-logs.md');

      try {
        const eventsFile = await fs.readFile(eventsPath, 'utf-8');
        events = JSON.parse(eventsFile);
        nightLogs = await fs.readFile(nightLogsPath, 'utf-8');
      } catch (err) {
        logger.error({ err }, 'Failed to read local data files');
        return res.status(500).json({ error: 'Failed to load local data files.' });
      }
    }

    const hotelId = events?.hotel?.id || 'unknown';
    // The "night" target is inferred by the latest events in the data, but for logging we can capture the date of generation
    const generationDate = new Date().toISOString();

    logger.info({
      action: 'generate_handover_start',
      hotel: hotelId,
      night: generationDate,
      demo_mode: !process.env.OPENAI_API_KEY || process.env.DEMO_MODE === 'true',
      message: 'Started handover generation process'
    });

    const handover = await generateHandover(events, nightLogs);

    logger.info({
      action: 'generate_handover_success',
      hotel: hotelId,
      night: generationDate,
      message: 'Successfully generated handover'
    });

    // Return the handover JSON. A frontend could easily render this.
    res.json(handover);

  } catch (error) {
    console.error('UNHANDLED ERROR:', error);
    logger.error({
      action: 'generate_handover_error',
      message: 'Failed to generate handover',
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'An error occurred during handover generation.', detail: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
