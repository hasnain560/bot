const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 ENV VARIABLES
const TOKEN = "mywhatsappbot";
const ACCESS_TOKEN = "EAAWqTw9MHPUBRTLZC44jSYkP51L7AO1unlFaK5ZCE2z930ZC3zNxe9UZC9GcNzwkVLS9GUVde5BxmsceUpzpplJ95OeEEKewvdTVYdxzRHWLCdkgsYy7r3215RuYMPqaWmBFYBs5ZAZC7LZC20WJhmoaT1q3sms8MwYwZAqT18P7Jw9tnQAf2RAvIsdUpv0LmTuZBY2AOYFdJsIYHUNgcEJ711ZCqAQK9BDtRpPtFaCETLZBW1YGKEfZCsd4EQYQdPSxSFxOvVxP9MGfiZCzVU2ucwmMMory7";
const PHONE_ID = "1045686435297043";
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

const msg = entry.messages[0];
const from = msg.from;
const text = msg.text?.body;

if (!text) return res.sendStatus(200);

const reply = "Hello from bot ✅";

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
