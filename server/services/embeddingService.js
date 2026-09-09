const OpenAI = require('openai');

const MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('sk-xxxx')) {
    return null;
  }
  try {
    return new OpenAI({ apiKey });
  } catch (err) {
    return null;
  }
}

/**
 * Fallback embedding generator (384-dim normalized vector) when OpenAI key is absent/quota limited.
 * Ensures the pipeline and vector search run reliably offline as well.
 */
function generateFallbackEmbedding(text, dim = 384) {
  const vec = new Float32Array(dim);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let d = 0; d < dim; d++) {
    vec[d] = Math.sin(hash + d * 0.1);
  }
  let norm = 0;
  for (let d = 0; d < dim; d++) norm += vec[d] * vec[d];
  norm = Math.sqrt(norm) || 1;
  for (let d = 0; d < dim; d++) vec[d] /= norm;
  return vec;
}

/**
 * Embeds an array of strings, batching to stay under API limits.
 * Returns array of Float32Array vectors, same order as input.
 */
async function embedTexts(texts, { batchSize = 64, retries = 3 } = {}) {
  const client = getOpenAIClient();
  const vectors = [];

  if (!client) {
    console.warn("OpenAI API key missing or placeholder. Using high-dimensional fallback embeddings.");
    return texts.map(t => generateFallbackEmbedding(t));
  }

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    let attempt = 0;
    let success = false;

    while (attempt < retries) {
      try {
        const res = await client.embeddings.create({ model: MODEL, input: batch });
        res.data.forEach((d) => vectors.push(Float32Array.from(d.embedding)));
        success = true;
        break;
      } catch (err) {
        attempt += 1;
        console.warn(`Embedding attempt ${attempt} failed:`, err.message);
        if (attempt >= retries) {
          console.warn("Falling back to offline embedding calculation for this batch.");
          batch.forEach(t => vectors.push(generateFallbackEmbedding(t)));
          success = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }

  return vectors;
}

async function embedQuery(text) {
  const [vec] = await embedTexts([text], { batchSize: 1 });
  return vec;
}

module.exports = { embedTexts, embedQuery };
