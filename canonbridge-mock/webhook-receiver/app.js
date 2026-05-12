import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const app = express();
const port = Number(process.env.PORT || 3000);
const storageDir = process.env.WEBHOOK_STORAGE_DIR || path.join(process.cwd(), "webhooks");
const received = [];

app.use(express.json({ limit: "1mb", type: ["application/json", "application/*+json"] }));
app.use(express.text({ limit: "1mb", type: ["text/*", "application/xml", "text/xml"] }));

async function persistWebhook(kind, payload, headers) {
  await fs.mkdir(storageDir, { recursive: true });
  const eventId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const record = {
    eventId,
    kind,
    receivedAt,
    headers: {
      "content-type": headers["content-type"],
      "x-payflex-signature": headers["x-payflex-signature"],
      "x-canonbridge-demo": headers["x-canonbridge-demo"]
    },
    payload
  };

  const fileName = `${receivedAt.replace(/[:.]/g, "-")}-${kind}-${eventId}.json`;
  await fs.writeFile(path.join(storageDir, fileName), JSON.stringify(record, null, 2));
  received.unshift(record);
  received.splice(50);
  return record;
}

app.get("/health", (_req, res) => {
  res.json({ status: "UP", service: "canonbridge-webhook-receiver", receivedCount: received.length });
});

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>CanonBridge Webhook Receiver</title></head>
<body>
  <h1>CanonBridge Webhook Receiver</h1>
  <p>POST payment confirmations to <code>/webhook/payment</code>.</p>
  <p>View recent captured webhooks at <a href="/webhooks">/webhooks</a>.</p>
</body>
</html>`);
});

app.get("/webhooks", (_req, res) => {
  res.json({
    service: "canonbridge-webhook-receiver",
    count: received.length,
    items: received
  });
});

app.post("/webhook/payment", async (req, res, next) => {
  try {
    const record = await persistWebhook("payment", req.body, req.headers);
    console.log(JSON.stringify({ message: "payment webhook captured", eventId: record.eventId }));
    res.status(202).json({
      accepted: true,
      eventId: record.eventId,
      receivedAt: record.receivedAt,
      canonicalHint: {
        eventType: "PAYMENT_CONFIRMED",
        partner: "payflex",
        rawTopic: "partner.payflex.raw"
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    accepted: false,
    error: {
      code: "WEBHOOK_RECEIVER_ERROR",
      message: error.message
    }
  });
});

app.listen(port, () => {
  console.log(`CanonBridge webhook receiver listening on port ${port}`);
});

