import express from "express";
import fs from "fs";
import path from "path";
import sgMail from "@sendgrid/mail";

const app = express();
const PORT = process.env.PORT || 3000;

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFile = path.join(logDir, "ips.log");

async function sendEmail(text) {
  const msg = {
    to: process.env.EMAIL_TO,
    from: process.env.EMAIL_TO, // must be verified in SendGrid
    subject: "New Visitor Logged",
    text
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Email error:", error);
  }
}

app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  const logLine = `${timestamp} - IP: ${ip} - UA: ${ua}\n`;

  fs.appendFileSync(logFile, logLine);

  await sendEmail(logLine);

  res.send(`<h1>y r u checking my truecaller profile</h1>`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
