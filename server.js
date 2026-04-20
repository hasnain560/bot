 const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 ENV VARIABLES
const TOKEN = "mywhatsappbot";
const ACCESS_TOKEN = "EAAWqTw9MHPUBRQeW8Wf86s9cUDfLDhmZCgMsLT9k2Hy87edJKZC5oWjqgL4V0faANJbcVoXjB98GltEVilmZBtPkWgOeZBoESHb4EgPfMQdxCKBHZCTP69tf1iZCYhusn1XGMHijWMSI9WYoQjEZAbu3JYgNLFbSHfAVxaQmWisHD2hcLwXDOgOjJGCvG2aP51gPcH7q6QZCWqnbWvZAmCj0I0nNETFWZCx8oGlV7M93Xt9ZAuZCl3vLXfcozsTpUWNwaNjmtdqaWuDnYgYVU4B7k0HGXU95";
const PHONE_ID = "1045686435297043";
const OPENROUTER_KEY = "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";

// 🔹 Webhook verify
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === TOKEN) {
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 🔹 Receive messages
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body.entry[0].changes[0].value.messages[0];
    const from = msg.from;
    const text = msg.text.body;

    // 🤖 AI call
    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a friendly WhatsApp AI assistant. Reply short and helpful."
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
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Bot running 🚀"));