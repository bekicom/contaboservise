// server.js
import express from "express";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import http from "http";

const PORT = process.env.PORT || 8085;
const app = express();

// JSON qabul qilish uchun middleware
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// HTTP server yaratamiz
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });
let clients = [];

// WebSocket ulanishi
wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("🟢 Frontend ulandi. Jami:", clients.length);

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
    console.log("🔴 Frontend uzildi. Qolgan:", clients.length);
  });
});

// Hikvision'dan keladigan HTTP POST (Alarm Server)
app.post("/hikvision-event", (req, res) => {
  console.log("📩 Hikvision event:", req.body);

  // Eventni WebSocket orqali barcha frontend’ga yuborish
  clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(req.body));
    }
  });

  // Hikvision push ishlashi uchun javob
  res.status(200).send("OK");
});

// Server ishga tushirish
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server ishga tushdi: http://0.0.0.0:${PORT}`);
  console.log(`🌐 WebSocket: ws://<server-ip>:${PORT}`);
});
