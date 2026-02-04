import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;

  const results = {};

  results.ChatGPT = await callOpenAI(prompt);
  results.Gemini = await callGemini(prompt);
  results.Claude = await callClaude(prompt);

  res.json(results);
});

async function callOpenAI(prompt) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const j = await r.json();
  return j.choices?.[0]?.message?.content;
}

async function callGemini(prompt) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function callClaude(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const j = await r.json();
  return j.content?.[0]?.text;
}

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
