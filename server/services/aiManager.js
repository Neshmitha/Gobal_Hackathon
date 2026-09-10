const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const getGeminiKeys = () => (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(k => k.startsWith('AIzaSy'));
const getGroqKeys = () => (process.env.GROQ_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

let geminiPointer = 0;
let groqPointer = 0;

const getGenAIInstance = () => {
    const geminiKeys = getGeminiKeys();
    if (!geminiKeys.length) return null;
    const key = geminiKeys[geminiPointer % geminiKeys.length];
    geminiPointer = (geminiPointer + 1) % geminiKeys.length;
    return new GoogleGenerativeAI(key);
};

const getGroqInstance = () => {
    const groqKeys = getGroqKeys();
    if (!groqKeys.length) return null;
    const key = groqKeys[groqPointer % groqKeys.length];
    groqPointer = (groqPointer + 1) % groqKeys.length;
    return new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' });
};

// Priority list of active, ultra-fast Google Gemini models
const DEFAULT_GEMINI_MODELS = [
    'gemini-3.6-flash',
    'gemini-flash-latest'
];

/**
 * Direct REST helper for Gemini API call with 60s timeout & 8192 token limit
 */
async function callGeminiRest(apiKey, modelName, prompt, options = {}) {
    const { maxTokens = 8192, temperature = 0.7 } = options;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || response.statusText;
        const err = new Error(`Gemini API Error [${response.status}]: ${message}`);
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;
    if (textPart) return textPart;

    throw new Error(`Empty response from Gemini model ${modelName}`);
}

/**
 * Direct SSE Streaming REST helper for Gemini API call with 60s connection timeout & 8192 token limit
 */
async function streamGeminiRest(apiKey, modelName, prompt, onChunk) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || response.statusText;
        const err = new Error(`Gemini Stream Error [${response.status}]: ${message}`);
        err.status = response.status;
        throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr && jsonStr !== '[DONE]') {
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) onChunk(text);
              } catch (_) {}
            }
          }
        }
    }
}

/**
 * Robust AI Interface with Key Rotation & Fallback
 */
const runAIWithPool = async (prompt, options = {}) => {
    const {
        geminiModels = DEFAULT_GEMINI_MODELS,
        groqModel = 'llama-3.3-70b-versatile',
        jsonMode = false,
        maxTokens = 2048,
        temperature = 0.8
    } = options;

    const geminiKeys = getGeminiKeys();
    const groqKeys = getGroqKeys();

    let lastError = null;

    // Phase 1: Try Gemini Pool
    if (geminiKeys.length > 0) {
        for (let k = 0; k < geminiKeys.length; k++) {
            const currentKey = geminiKeys[geminiPointer % geminiKeys.length];
            const currentKeyIndex = geminiPointer % geminiKeys.length;
            geminiPointer = (geminiPointer + 1) % geminiKeys.length;

            for (const modelName of geminiModels) {
                try {
                    console.log(`[AI POOL] Running Gemini (${modelName}) | Key #${currentKeyIndex + 1}`);
                    const text = await callGeminiRest(currentKey, modelName, prompt, { maxTokens, temperature });
                    if (text) return text;
                } catch (e) {
                    lastError = e;
                    const status = e.status || 500;
                    console.warn(`[AI POOL] Gemini (${modelName}) failed [${status}]:`, e.message);

                    // Rate limit or quota error: try next key
                    if (status === 429 || status === 403 || status === 404) {
                        console.log(`[AI POOL] Key #${currentKeyIndex + 1} (${modelName}) failed [${status}]. Rotating key...`);
                        break;
                    }
                }
            }
        }
    }

    // Phase 2: Try Groq Pool
    if (groqKeys.length > 0) {
        console.warn('[AI POOL] Gemini pool exhausted or rate limited. Switching to Groq...');
        for (let g = 0; g < groqKeys.length; g++) {
            const groq = getGroqInstance();
            if (!groq) break;
            const currentGroqIndex = (groqPointer - 1 + groqKeys.length) % groqKeys.length;

            try {
                console.log(`[AI POOL] Running Groq (${groqModel}) | Key #${currentGroqIndex + 1}`);
                const chatParams = {
                    messages: [{ role: 'user', content: prompt + (jsonMode ? ' Return ONLY valid JSON.' : '') }],
                    model: groqModel,
                    temperature
                };
                if (jsonMode) chatParams.response_format = { type: "json_object" };

                const chat = await groq.chat.completions.create(chatParams);
                const text = chat.choices[0]?.message?.content;
                if (text) return text;
            } catch (e) {
                lastError = e;
                console.error(`[AI POOL] Groq failure [${e.status || 'ERR'}]:`, e.message);
                if (e.status === 429) continue;
            }
        }
    }

    throw new Error(`AI Pool Connection Failed: ${lastError?.message || 'Services Unavailable'}`);
};

/**
 * Robust AI Interface with Key Rotation & Fallback (Streaming Support)
 */
const runAIStreamWithPool = async (prompt, onChunk, options = {}) => {
    const {
        geminiModels = DEFAULT_GEMINI_MODELS,
        groqModel = 'llama-3.3-70b-versatile',
    } = options;

    const geminiKeys = getGeminiKeys();
    const groqKeys = getGroqKeys();

    let lastError = null;

    // Phase 1: Try Gemini Pool
    if (geminiKeys.length > 0) {
        for (let k = 0; k < geminiKeys.length; k++) {
            const currentKey = geminiKeys[geminiPointer % geminiKeys.length];
            const currentKeyIndex = geminiPointer % geminiKeys.length;
            geminiPointer = (geminiPointer + 1) % geminiKeys.length;

            for (const modelName of geminiModels) {
                try {
                    console.log(`[AI POOL] Streaming Gemini (${modelName}) | Key #${currentKeyIndex + 1}`);
                    await streamGeminiRest(currentKey, modelName, prompt, onChunk);
                    return; // Success
                } catch (e) {
                    lastError = e;
                    const status = e.status || 500;
                    console.warn(`[AI POOL] Stream Gemini (${modelName}) failed [${status}]:`, e.message);

                    if (status === 429 || status === 403 || status === 404) {
                        console.log(`[AI POOL] Key #${currentKeyIndex + 1} (${modelName}) failed [${status}]. Rotating key...`);
                        break;
                    }
                }
            }
        }
    }

    // Phase 2: Try Groq Pool
    if (groqKeys.length > 0) {
        console.warn('[AI POOL] Gemini Stream pool exhausted. Switching to Groq...');
        for (let g = 0; g < groqKeys.length; g++) {
            const groq = getGroqInstance();
            if (!groq) break;
            const currentGroqIndex = (groqPointer - 1 + groqKeys.length) % groqKeys.length;

            try {
                console.log(`[AI POOL] Streaming Groq (${groqModel}) | Key #${currentGroqIndex + 1}`);
                const stream = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: groqModel,
                    stream: true,
                });

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) onChunk(content);
                }
                return; // Success
            } catch (e) {
                lastError = e;
                console.error(`[AI POOL] Groq Stream failure [${e.status || 'ERR'}]:`, e.message);
                if (e.status === 429) continue;
            }
        }
    }

    throw new Error(`AI Pool Stream Failed: ${lastError?.message || 'Services Unavailable'}`);
};

module.exports = {
    runAIWithPool,
    runAIStreamWithPool,
    getGenAIInstance,
    getGroqInstance
};
