const { EventEmitter } = require("events");

// One emitter per ingest job, keyed by jobId. Cleaned up after stream closes.
const jobs = new Map();

function createJob(jobId) {
  const emitter = new EventEmitter();
  jobs.set(jobId, emitter);
  return emitter;
}

function getJob(jobId) {
  return jobs.get(jobId);
}

function removeJob(jobId) {
  jobs.delete(jobId);
}

const STEPS = [
  "PAPER_SELECTED",
  "PARSING_PDF",
  "TEXT_CLEANED",
  "SECTIONS_DETECTED",
  "TEXT_CHUNKED",
  "METADATA_CREATED",
  "EMBEDDINGS_GENERATED",
  "FAISS_INDEX_BUILT",
  "METADATA_SAVED",
  "READY"
];

function emitStep(emitter, step, status, extra = {}) {
  if (!emitter) return;
  emitter.emit("progress", { step, status, ...extra, ts: Date.now() });
  if (step === "READY" && status === "done") emitter.emit("complete");
  if (status === "error") emitter.emit("failed", extra);
}

module.exports = {
  createJob,
  getJob,
  removeJob,
  STEPS,
  emitStep
};
