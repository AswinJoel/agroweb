import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Real-time Delivery Store
  const activeDeliveries = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-delivery", (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Socket ${socket.id} joined order-${orderId}`);
    });

    socket.on("update-location", (data) => {
      // data: { orderId, lat, lng, speed, heading }
      const { orderId, lat, lng } = data;
      activeDeliveries.set(orderId, { lat, lng, updatedAt: Date.now() });
      io.to(`order-${orderId}`).emit("location-updated", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "AgroConnect Backend" });
  });

  // Google Sheets Sync Bridge
  app.post("/api/sync-sheets", async (req, res) => {
    try {
      const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
      if (!scriptUrl) {
        return res.status(500).json({ error: "Google Apps Script URL not configured" });
      }

      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Sheets Sync Error:", error);
      res.status(500).json({ error: "Failed to sync with Google Sheets" });
    }
  });

  // PayPal Transaction Verification (Placeholder)
  app.post("/api/payments/verify", async (req, res) => {
    const { orderID } = req.body;
    // In production, you would call PayPal API to verify the capture
    res.json({ status: "COMPLETED", transactionId: "PAYID-" + Math.random().toString(36).substr(2, 9) });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`AgroConnect server running at http://localhost:${PORT}`);
  });
}

startServer();
