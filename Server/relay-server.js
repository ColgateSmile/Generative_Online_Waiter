const WebSocket = require("ws");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = 8080;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error(
      `Environment variable "OPENAI_API_KEY" is required.\n` +
        `Please set it in your .env file.`
    );
    process.exit(1);
  }
  
const REALTIME_API_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

// Root route
app.get("/", (req, res) => {
  res.send("Relay server is running!");
});

app.use(express.json());

app.post("/connect", (req, res) => {
  const ws = new WebSocket(REALTIME_API_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  ws.on("open", () => {
    console.log("WebSocket connected to OpenAI API.");
    res.status(200).send("WebSocket connection established.");
  });

  ws.on("message", (data) => {
    console.log("Message from OpenAI:", data.toString());
  });

  ws.on("error", (error) => {
    console.error("WebSocket Error:", error.message);
    res.status(500).send({ error: error.message });
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
});

app.listen(PORT, () => {
  console.log(`Relay server running on http://localhost:${PORT}`);
});
