import WebSocket, { WebSocketServer } from "ws";

const PORT = 8085;
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 WS server ishga tushdi: wss://your-server-domain:${PORT}`);

wss.on("connection", (ws, req) => {
  console.log("🟢 Yangi client ulandi:", req.socket.remoteAddress);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 Yangi hodim event:", data);

      // Barcha frontend clientlarga yuborish
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.log("⚠️ JSON parsing xatosi:", message.toString());
    }
  });

  ws.on("close", () =>
    console.log("🔴 Client uzildi:", req.socket.remoteAddress)
  );
  ws.on("error", (err) => console.error("❌ WS xatosi:", err.message));
});
