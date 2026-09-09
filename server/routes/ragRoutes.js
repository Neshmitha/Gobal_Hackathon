const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createJob, getJob, removeJob } = require("../services/progressEmitter.js");
const { runIngestPipeline, answerQuery } = require("../services/ragPipeline.js");
const { isIndexed, loadIndex } = require("../services/faissService.js");
const RagDocument = require("../models/RagDocument.js");

const router = express.Router();

// Multer storage for uploads
const uploadDir = path.join(__dirname, "..", "data", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
});
const upload = multer({ storage });

// Helper to validate and sanitize paperId and domain to prevent path traversal
function sanitizeId(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

// POST /api/rag/index-paper
router.post("/index-paper", upload.single("file"), async (req, res) => {
  let { domain, paperId, filePath, title, authors, year } = req.body;

  if (req.file) {
    filePath = req.file.path;
  }

  if (!domain || !paperId) {
    return res.status(400).json({ error: "domain and paperId are required" });
  }

  const safeDomain = sanitizeId(domain);
  const safePaperId = sanitizeId(paperId);
  const safeFilePath = filePath ? path.resolve(filePath) : path.join(uploadDir, "sample.pdf");

  const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const emitter = createJob(jobId);

  // Run ingest pipeline async
  runIngestPipeline({
    domain: safeDomain,
    paperId: safePaperId,
    filePath: safeFilePath,
    title,
    authors,
    year
  }, emitter);

  res.json({
    jobId,
    domain: safeDomain,
    paperId: safePaperId,
    filePath: safeFilePath,
    statusUrl: `/api/rag/status/${safePaperId}`,
    streamUrl: `/api/rag/pipeline/${jobId}`
  });
});

// GET /api/rag/pipeline/:jobId (SSE Stream for Live 10-Stage Pipeline)
router.get("/pipeline/:jobId", (req, res) => {
  const { jobId } = req.params;
  const emitter = getJob(jobId);
  if (!emitter) return res.status(404).json({ error: "Pipeline job not found or expired" });

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  if (res.flushHeaders) res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const onProgress = (data) => send("progress", data);
  const onComplete = () => { send("complete", { jobId }); cleanup(); };
  const onFailed = (data) => { send("error", data); cleanup(); };

  function cleanup() {
    emitter.off("progress", onProgress);
    emitter.off("complete", onComplete);
    emitter.off("failed", onFailed);
    removeJob(jobId);
    res.end();
  }

  emitter.on("progress", onProgress);
  emitter.on("complete", onComplete);
  emitter.on("failed", onFailed);

  req.on("close", cleanup);
});

// GET /api/rag/status/:paperId
router.get("/status/:paperId", async (req, res) => {
  const { paperId } = req.params;
  const { domain } = req.query;
  const safeDomain = sanitizeId(domain || "General");
  const safePaperId = sanitizeId(paperId);

  const indexed = isIndexed(safeDomain, safePaperId);
  if (!indexed) {
    return res.json({ indexed: false, status: "not_indexed" });
  }

  try {
    const { manifest } = await loadIndex(safeDomain, safePaperId);
    res.json({
      indexed: true,
      status: "ready",
      manifest
    });
  } catch (err) {
    res.json({ indexed: true, status: "ready" });
  }
});

// POST /api/rag/query
router.post("/query", async (req, res) => {
  const { domain, paperId, question, topK } = req.body;
  if (!domain || !paperId || !question) {
    return res.status(400).json({ error: "domain, paperId, question are required" });
  }

  try {
    const safeDomain = sanitizeId(domain);
    const safePaperId = sanitizeId(paperId);
    const result = await answerQuery({
      domain: safeDomain,
      paperId: safePaperId,
      question: question.trim(),
      topK: Number(topK) || 5
    });

    res.json(result);
  } catch (err) {
    console.error("RAG Query Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
