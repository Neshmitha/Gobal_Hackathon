const express = require("express");
const { v4: uuidv4 } = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createJob, getJob, removeJob } = require("../services/progressEmitter.js");
const { runIngestPipeline } = require("../services/ragPipeline.js");

const router = express.Router();

// Multer storage for RAG uploads
const uploadDir = path.join(__dirname, "..", "data", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
});
const upload = multer({ storage });

// POST /api/papers/ingest
// Accepts JSON { domain, paperId, filePath } OR multipart form with PDF file
router.post("/ingest", upload.single("file"), (req, res) => {
  let { domain, paperId, filePath } = req.body;

  if (req.file) {
    filePath = req.file.path;
  }

  if (!domain || !paperId || !filePath) {
    return res.status(400).json({ error: "domain, paperId, and filePath (or file) are required" });
  }

  const jobId = uuidv4 ? uuidv4() : `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const emitter = createJob(jobId);

  // Run pipeline async; progress flows through SSE stream
  runIngestPipeline({ domain, paperId, filePath }, emitter);

  res.json({ jobId, domain, paperId, filePath });
});

// GET /api/papers/ingest/stream/:jobId (SSE Progress Stream)
router.get("/ingest/stream/:jobId", (req, res) => {
  const { jobId } = req.params;
  const emitter = getJob(jobId);
  if (!emitter) return res.status(404).end();

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

module.exports = router;
