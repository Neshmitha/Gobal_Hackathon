const mongoose = require('mongoose');

const RagDocumentSchema = new mongoose.Schema({
  paperId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  domain: { type: String, required: true },
  authors: { type: [String], default: [] },
  year: { type: Number, default: 2020 },
  totalPages: { type: Number, default: 1 },
  totalChunks: { type: Number, default: 0 },
  totalWords: { type: Number, default: 0 },
  embeddingModel: { type: String, default: 'text-embedding-3-small' },
  embeddingDimension: { type: Number, default: 1536 },
  indexType: { type: String, default: 'IndexFlatL2' },
  chunkSize: { type: Number, default: 1000 },
  chunkOverlap: { type: Number, default: 150 },
  indexPath: { type: String, required: true },
  metadataPath: { type: String, required: true },
  manifestPath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'ready', 'failed'], default: 'pending' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('RagDocument', RagDocumentSchema);
