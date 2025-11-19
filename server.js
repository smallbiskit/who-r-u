import express from "express";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3000;

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, "ips.log");

async function sendEmail(subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject,
      text
    });
  } catch (err) {
    console.error("Email error:", err);
  }
}

app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const timestamp = new Date().toISOString();

  const logLine = `${timestamp} - IP: ${ip} - UA: ${ua}\n`;

  // Save to local log file
  fs.appendFileSync(logFile, logLine);

  // Send email
  await sendEmail("New Visitor Logged", logLine);

  res.send(`
    <h1>y r u checking my truecaller profile</h1>
    <p>🤣</p>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
