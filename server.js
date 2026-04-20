const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 ENV VARIABLES
const TOKEN = process.env.VERIFY_TOKEN || "mywhatsappbot";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

// ==============================
// ✅ WEBHOOK VERIFY (GET)
// ==============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === TOKEN) {
    console.log("Webhook verified ✅");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ==============================
// ✅ WEBHOOK RECEIVE (POST)
// ==============================
app.post("/webhook", async (req, res) => {
  console.log("BODY:", JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;

    if (!entry || !entry.messages) {
      return res.sendStatus(200);
    }

    const msg = entry.messages[0];
    const from = msg.from;
    const text = msg.text?.body;

    console.log("FROM:", from);
    console.log("TEXT:", text);

    if (!text) return res.sendStatus(200);

    // ==============================
    // 🤖 AI REPLY (OpenRouter optional)
    // ==============================
    let reply = "Hello from bot ✅";

    if (OPENROUTER_KEY) {
      try {
        const aiRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful WhatsApp assistant." },
              { role: "user", content: text }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        reply = aiRes.data.choices[0].message.content;
      } catch (err) {
        console.log("AI ERROR:", err.response?.data || err.message);
      }
    }

    // ==============================
    // 📩 SEND MESSAGE
    // ==============================
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("SENT:", response.data);

    res.sendStatus(200);

  } catch (err) {
    console.error("ERROR STATUS:", err.response?.status);
    console.error("ERROR DATA:", err.response?.data);
    res.sendStatus(500);
  }
});

// ==============================
// 🚀 SERVER START (RAILWAY FIX)
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
