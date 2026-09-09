const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'data', 'indexes');

function indexPaths(domain, paperId) {
  const safeDomain = String(domain).replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePaperId = String(paperId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(BASE_DIR, safeDomain, safePaperId);
  return { 
    dir, 
    indexFile: path.join(dir, "index.faiss"), 
    metaFile: path.join(dir, "chunks.jsonl"),
    manifestFile: path.join(dir, "manifest.json")
  };
}

let FaissNode = null;
try {
  FaissNode = require('faiss-node');
} catch (e) {
  console.log('Native faiss-node not available, using high-performance vector index engine.');
}

/**
 * Pure JS IndexFlatL2 Fallback Engine for cross-platform stability
 */
class PureVectorIndexFlatL2 {
  constructor(dim) {
    this.dim = dim;
    this.vectors = [];
  }

  add(vector) {
    this.vectors.push(new Float32Array(vector));
  }

  search(queryVector, topK) {
    const q = new Float32Array(queryVector);
    const scores = this.vectors.map((v, row) => {
      let sum = 0;
      for (let i = 0; i < this.dim; i++) {
        const diff = v[i] - q[i];
        sum += diff * diff;
      }
      return { row, distance: sum };
    });

    scores.sort((a, b) => a.distance - b.distance);
    const top = scores.slice(0, topK);
    return {
      labels: top.map(t => t.row),
      distances: top.map(t => t.distance)
    };
  }

  async saveToFile(filePath) {
    const header = Buffer.alloc(8);
    header.writeUInt32LE(this.dim, 0);
    header.writeUInt32LE(this.vectors.length, 4);

    const vecBuffers = this.vectors.map(v => Buffer.from(v.buffer));
    const finalBuffer = Buffer.concat([header, ...vecBuffers]);
    await fs.writeFile(filePath, finalBuffer);
  }

  static async readFromFile(filePath) {
    const buffer = await fs.readFile(filePath);
    const dim = buffer.readUInt32LE(0);
    const count = buffer.readUInt32LE(4);
    const index = new PureVectorIndexFlatL2(dim);

    let offset = 8;
    const bytesPerVector = dim * 4;
    for (let i = 0; i < count; i++) {
      const slice = buffer.subarray(offset, offset + bytesPerVector);
      const floatArr = new Float32Array(slice.buffer, slice.byteOffset, dim);
      index.add(floatArr);
      offset += bytesPerVector;
    }
    return index;
  }
}

/**
 * Checks if a paper is already indexed with matching parameters (Re-index prevention)
 */
function isIndexed(domain, paperId, chunkSize = 1000, chunkOverlap = 150) {
  const { indexFile, metaFile, manifestFile } = indexPaths(domain, paperId);
  if (!fsSync.existsSync(indexFile) || !fsSync.existsSync(metaFile) || !fsSync.existsSync(manifestFile)) {
    return false;
  }

  try {
    const manifest = JSON.parse(fsSync.readFileSync(manifestFile, 'utf-8'));
    if (manifest.status === 'ready' && manifest.chunkSize === chunkSize && manifest.chunkOverlap === chunkOverlap) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

/**
 * Builds a fresh FAISS index for a paper from embedded chunks and persists it with manifest.
 */
async function buildAndSaveIndex(domain, paperId, chunks, vectors, extraMeta = {}) {
  const { dir, indexFile, metaFile, manifestFile } = indexPaths(domain, paperId);
  await fs.mkdir(dir, { recursive: true });

  const dim = vectors[0].length;

  if (FaissNode && FaissNode.IndexFlatL2) {
    try {
      const index = new FaissNode.IndexFlatL2(dim);
      vectors.forEach((v) => index.add(Array.from(v)));
      index.write(indexFile);
    } catch (err) {
      console.warn("faiss-node write failed, using vector engine fallback:", err.message);
      const index = new PureVectorIndexFlatL2(dim);
      vectors.forEach((v) => index.add(v));
      await index.saveToFile(indexFile);
    }
  } else {
    const index = new PureVectorIndexFlatL2(dim);
    vectors.forEach((v) => index.add(v));
    await index.saveToFile(indexFile);
  }

  // Save chunks sidecar metadata, ensuring strict FAISS row i <-> chunk i mapping
  const metaLines = chunks.map((c, i) => JSON.stringify({ row: i, ...c })).join("\n");
  await fs.writeFile(metaFile, metaLines, "utf-8");

  // Save manifest.json
  const manifest = {
    paperId,
    title: extraMeta.title || "Untitled Paper",
    domain,
    totalPages: extraMeta.totalPages || 1,
    totalChunks: chunks.length,
    embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    embeddingDimension: dim,
    indexType: "IndexFlatL2",
    chunkSize: extraMeta.chunkSize || 1000,
    chunkOverlap: extraMeta.chunkOverlap || 150,
    createdAt: new Date().toISOString(),
    version: 1,
    status: "ready"
  };
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2), "utf-8");

  return { indexFile, metaFile, manifestFile, vectorCount: vectors.length, dim, manifest };
}

async function loadIndex(domain, paperId) {
  const { indexFile, metaFile, manifestFile } = indexPaths(domain, paperId);

  let index = null;
  if (FaissNode && FaissNode.IndexFlatL2) {
    try {
      index = FaissNode.IndexFlatL2.read(indexFile);
    } catch (e) {
      index = await PureVectorIndexFlatL2.readFromFile(indexFile);
    }
  } else {
    index = await PureVectorIndexFlatL2.readFromFile(indexFile);
  }

  const metaRaw = await fs.readFile(metaFile, "utf-8");
  const meta = metaRaw.split("\n").filter(Boolean).map((l) => JSON.parse(l));

  let manifest = null;
  try {
    manifest = JSON.parse(await fs.readFile(manifestFile, "utf-8"));
  } catch (e) {
    manifest = null;
  }

  return { index, meta, manifest };
}

async function search(domain, paperId, queryVector, topK = 5) {
  const { index, meta } = await loadIndex(domain, paperId);
  const qArr = Array.from(queryVector);

  let result = null;
  if (index.search) {
    result = index.search(qArr, topK);
  }

  if (!result || !result.labels) {
    throw new Error("SEARCH_FAILED: Invalid vector index state");
  }

  return result.labels.map((row, i) => {
    const chunkObj = meta[row] || {};
    return {
      ...chunkObj,
      score: result.distances ? result.distances[i] : 0,
    };
  });
}

module.exports = {
  isIndexed,
  buildAndSaveIndex,
  loadIndex,
  search
};
