import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in environment variables. AI features may fail.");
}

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Debug Logger & Security Headers
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    next();
  });

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
  app.get("/api/ai/health", (req, res) => res.json({ status: "ready" }));

  app.post("/api/ai/analyze-plant", async (req, res) => {
    console.log("AI Analysis Request: Image data received");
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        console.warn("AI Analysis: No image data provided");
        return res.status(400).json({ error: "No image data provided" });
      }

      console.log("AI Analysis: Sending to Gemini (gemini-3-flash-preview)...");
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: "Analyze this plant leaf image for any diseases. Return the result in JSON format with keys: disease, confidence, treatment, prevention, severity. Only return the JSON." },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const text = response.text || "";
      console.log("AI Analysis: Gemini success");
      const jsonText = text.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(jsonText));
    } catch (error: any) {
      console.error("AI Analysis Proxy Error:", error);
      // Try fallback to standard model if 3-flash-preview fails (robustness)
      try {
        console.log("AI Analysis: Attempting fallback to gemini-1.5-flash...");
        const fallback = await genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{
            role: "user",
            parts: [
              { text: "Analyze this plant leaf image for any diseases. Return JSON with keys: disease, confidence, treatment, prevention, severity. Only return JSON." },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
            ]
          }],
          config: { responseMimeType: "application/json" }
        });
        const text = fallback.text || "";
        res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
      } catch (fallbackErr: any) {
        res.status(500).json({ 
          error: "Internal Processing Error", 
          details: error.message,
          suggestion: "Ensure the image is clear and not too large."
        });
      }
    }
  });

  // AI Chat Proxy
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      console.log("AI Chat: Sending to Gemini (gemini-3-flash-preview)...");
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `${context}\n\nUser says: ${message}` }]
          }
        ],
        config: {
          systemInstruction: "You are an AI assistant for AgroConnect, a platform connecting farmers and consumers. Provide helpful, concise agricultural or marketplace advice."
        }
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // API 404 Logger (placed before Vite middleware)
  app.use("/api/*", (req, res) => {
    console.warn(`Unmatched API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: "API Endpoint Not Found", 
      path: req.originalUrl,
      method: req.method,
      suggestion: "Check if the endpoint is registered correctly in server.ts"
    });
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
