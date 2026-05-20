/**
 * Kenya Financial Intelligence — WhatsApp Bot
 *
 * whatsapp-web.js receives messages → forwards to FastAPI /webhook/whatsapp
 * FastAPI runs RAG + decision engine → returns {to, body}
 * Bot sends reply back to WhatsApp
 *
 * Session persistence: LocalAuth (.wwebjs_auth/) — scan QR once only.
 */
require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const express = require("express");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || "change-me";
const BOT_PORT = parseInt(process.env.WHATSAPP_BRIDGE_PORT || "3001");

// Per-number rate limit: max 10 messages/minute
const rateLimit = new Map();
function isRateLimited(phone) {
  const now = Date.now();
  const entry = rateLimit.get(phone);
  if (!entry || now > entry.reset) {
    rateLimit.set(phone, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox", "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas",
      "--no-first-run", "--no-zygote",
      "--single-process", "--disable-gpu",
    ],
  },
});

client.on("qr", (qr) => {
  console.log("\n=== Scan QR code to connect WhatsApp ===");
  qrcode.generate(qr, { small: true });
  console.log("========================================\n");
});

client.on("authenticated", () => console.log("[auth] session saved"));
client.on("auth_failure", (msg) => console.error("[auth] failed:", msg));
client.on("ready", () => console.log("[whatsapp] ready ✓"));
client.on("disconnected", (reason) => {
  console.warn("[whatsapp] disconnected:", reason);
  setTimeout(() => client.initialize(), 10_000);
});

client.on("message", async (msg) => {
  if (msg.isGroupMsg || msg.from === "status@broadcast") return;
  if (!msg.body?.trim()) return;

  const phone = msg.from.replace("@c.us", "");
  if (isRateLimited(phone)) {
    await msg.reply("Too many messages — please wait a minute.");
    return;
  }

  console.log(`[msg] from=${phone} "${msg.body.substring(0, 80)}"`);

  try {
    const { data } = await axios.post(
      `${BACKEND_URL}/webhook/whatsapp`,
      {
        from_number: phone,
        message: msg.body,
        message_id: msg.id.id,
        timestamp: new Date(msg.timestamp * 1000).toISOString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-whatsapp-secret": WEBHOOK_SECRET,
        },
        timeout: 30_000,
      }
    );

    if (data.body) {
      await client.sendMessage(msg.from, data.body);
      console.log(`[reply] to=${phone} chars=${data.body.length}`);
    }
  } catch (err) {
    console.error(`[error] phone=${phone}`, err.response?.data || err.message);
    await msg.reply("Sorry, something went wrong. Please try again.");
  }
});

// Health server for Docker
const app = express();
app.get("/health", (_req, res) => res.json({ status: "ok", bot: "running" }));
app.listen(BOT_PORT, () => console.log(`[bridge] health on :${BOT_PORT}`));

client.initialize();
console.log("[whatsapp] initializing...");
