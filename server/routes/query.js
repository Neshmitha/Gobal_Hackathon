const express = require("express");
const { answerQuery } = require("../services/ragPipeline.js");

const router = express.Router();

router.post("/", async (req, res) => {
  const { domain, paperId, question, topK } = req.body;
  if (!domain || !paperId || !question) {
    return res.status(400).json({ error: "domain, paperId, question are required" });
  }
  try {
    const result = await answerQuery({ domain, paperId, question, topK: topK || 5 });
    res.json(result);
  } catch (err) {
    console.error("RAG Query Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
