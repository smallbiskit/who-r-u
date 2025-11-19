import express from "express";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3000;

// SendGrid SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey", // literally "apikey"
    pass: process.env.SENDGRID_API_KEY
  }
});

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFile = path.join(logDir, "ips.log");

async function sendEmail(subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_TO, // from your email
      to: process.env.EMAIL_TO,   // to your email
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

  // Save log locally
  fs.appendFileSync(logFile, logLine);

  // Send email
  await sendEmail("New Visitor Logged", logLine);

  res.send(`
    <h1>y r u checking my truecaller profile</h1>
    <p>🤣</p>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
