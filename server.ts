import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

  // AI Plant Disease Analysis Proxy
  app.post("/api/ai/analyze-plant", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "No image data provided" });

      const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analyze this plant leaf image for any diseases.
        Return the result in strict JSON format with the following keys:
        - disease: Name of the disease or "Healthy"
        - confidence: Percentage confidence (e.g. "95%")
        - treatment: Detailed suggested treatment or "N/A"
        - prevention: Prevention methods or "N/A"
        - severity: "Low", "Medium", or "High"
        Only return the JSON.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        }
      ]);

      const text = result.response.text();
      // Clean up markdown if present
      const jsonText = text.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(jsonText));
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // AI Chat Proxy
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Context: ${context}
        User says: ${message}
        You are an AI assistant for AgroConnect, a platform connecting farmers and consumers.
        Provide helpful, concise agricultural or marketplace advice.
      `;

      const result = await model.generateContent(prompt);
      res.json({ response: result.response.text() });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
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
