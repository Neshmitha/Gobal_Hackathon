const mongoose = require('mongoose');

const RagChunkSchema = new mongoose.Schema({
  paperId: { type: String, required: true, index: true },
  chunkId: { type: String, required: true, unique: true, index: true },
  row: { type: Number, required: true },
  text: { type: String, required: true },
  section: { type: String, default: 'Unknown' },
  subsection: { type: String, default: null },
  pageStart: { type: Number, required: true },
  pageEnd: { type: Number, required: true },
  pageConfidence: { type: String, enum: ['exact', 'approximate'], default: 'exact' },
  chunkIndex: { type: Number, required: true },
  totalChunks: { type: Number, required: true },
  characterCount: { type: Number, required: true },
  wordCount: { type: Number, required: true },
  source: { type: String, default: 'upload' },
  sourceUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('RagChunk', RagChunkSchema);
