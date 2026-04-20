const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 ENV VARIABLES
const TOKEN = "mywhatsappbot";
const ACCESS_TOKEN = "EAAWqTw9MHPUBRQeW8Wf86s9cUDfLDhmZCgMsLT9k2Hy87edJKZC5oWjqgL4V0faANJbcVoXjB98GltEVilmZBtPkWgOeZBoESHb4EgPfMQdxCKBHZCTP69tf1iZCYhusn1XGMHijWMSI9WYoQjEZAbu3JYgNLFbSHfAVxaQmWisHD2hcLwXDOgOjJGCvG2aP51gPcH7q6QZCWqnbWvZAmCj0I0nNETFWZCx8oGlV7M93Xt9ZAuZCl3vLXfcozsTpUWNwaNjmtdqaWuDnYgYVU4B7k0HGXU95";
const PHONE_ID = "1045686435297043";
const OPENROUTER_KEY = "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";

// ✅ ROOT FIX (Cannot GET / solve)
app.get("/", (req, res) => {
  res.send("Bot running 🚀");
});

// 🔹 Webhook verify (FIXED)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("VERIFY REQUEST:", mode, token);

  if (mode === "subscribe" && token === TOKEN) {
    return res.status(200).send(challenge); // ✅ ONLY challenge
  } else {
    return res.sendStatus(403);
  }
});

// 🔹 Receive messages (SAFE VERSION)
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;

    if (!entry || !entry.messages) {
      return res.sendStatus(200);
    }

    const msg = entry.messages[0];
    const from = msg.from;
    const text = msg.text?.body;

    if (!text) return res.sendStatus(200);

    // 🤖 AI call
    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Reply short, friendly, WhatsApp style. Use Urdu if user uses Urdu."
          },
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

    const reply = aiRes.data.choices[0].message.content;

    // 📤 Send message back
    await axios.post(
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

    res.sendStatus(200);

  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Bot running 🚀"));
