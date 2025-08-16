import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 4000;

// Middleware JSON
app.use(express.json());

// Hodim kelganda (POST /api/events)
app.post("/api/events", (req, res) => {
  const data = req.body;

  if (!data) {
    return res
      .status(400)
      .json({ success: false, message: "Bo'sh data keldi" });
  }

  // Hodisani faylga yozamiz (logs.json)
  fs.appendFileSync("logs.json", JSON.stringify(data) + "\n");

  console.log("📨 Yangi event keldi:", data);

  // WebSocket orqali frontendga yuboramiz
  const msg = JSON.stringify({ type: "access_event", data });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });

  return res.json({ success: true, message: "Event qabul qilindi" });
});

// WebSocket ulanishi
wss.on("connection", (ws) => {
  console.log("🟢 Frontend ulandi WebSocket orqali");
  ws.send(JSON.stringify({ type: "welcome", message: "WebSocket ishlayapti" }));
});

// Serverni ishga tushirish
server.listen(PORT, () => {
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`🌐 WS manzil: ws://localhost:${PORT}`);
});
