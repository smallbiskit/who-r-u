import express from "express";
import fs from "fs";
import path from "path";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram bot env vars (set these in Render)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Ensure log directory exists for Render local environment
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "ips.log");

// Function to send IP to Telegram
async function sendToTelegram(msg) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: msg,
            parse_mode: "HTML"
        });
    } catch (err) {
        console.error("Telegram error:", err.response?.data || err.message);
    }
}

app.get("/", (req, res) => {
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

    const ua = req.headers["user-agent"] || "unknown";

    const timestamp = new Date().toISOString();

    const logLine = `${timestamp} - IP: ${ip} - UA: ${ua}\n`;

    // Write to local log file (Render ephemeral, but OK)
    fs.appendFileSync(logFile, logLine);

    // Make a nice pretty Telegram message
    const telegramMessage = `
🔥 <b>New Visitor Logged</b>

🌐 <b>IP:</b> <code>${ip}</code>
📱 <b>Device:</b> ${ua}
⏰ <b>Time:</b> ${timestamp}
`;

    sendToTelegram(telegramMessage);

    res.send(`
        <h1>y r u checking my truecaller profile</h1>
        <p>🤣</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
