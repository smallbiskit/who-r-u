const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// If hosted behind proxy (Render, Railway, etc.)
app.set('trust proxy', true);

// Ensure logs directory exists
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
const LOG_FILE = path.join(LOG_DIR, 'ips.log');

// HTML Page
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>y r u checking my truecaller profile?</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f2f2f2;
      }
      .card {
        background: white;
        padding: 32px;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.1);
        text-align: center;
      }
      h1 { margin: 0 0 10px; }
      p { color: #555; margin: 0; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>y r u checking my truecaller profile?</h1>
      <p>(your visit has been logged)</p>
    </div>
  </body>
</html>`;
 
// Log IP + UA + time
app.get('/', (req, res) => {
  const ip = req.ip;
  const ua = req.get('User-Agent') || 'unknown';
  const timestamp = new Date().toISOString();

  const logEntry = `${timestamp} - IP: ${ip} - UA: ${ua}\n`;

  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error("Error logging IP:", err);
  });

  res.set('Cache-Control', 'no-store');
  res.send(html);
});

// Simple log download endpoint
app.get('/download-logs', (req, res) => {
  const secret = process.env.LOG_SECRET || "changeme";

  if (req.query.secret !== secret)
    return res.status(403).send("Forbidden");

  res.download(LOG_FILE);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
