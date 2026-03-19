// Background Service Worker — handles AI API calls

const BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

// Model waterfall: try each in order until one succeeds.
const MODEL_WATERFALL = [
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash'
];

const SYSTEM_PROMPT =
  'You are an academic assistant. I will provide a question and options from a textbook. ' +
  'Your task is to return ONLY the correct answer text. If it is an ordering question, ' +
  'provide the sequence. If it is free text, provide a concise answer. No conversational filler.';

/**
 * Call one specific Gemini model.
 * Throws { status, retryAfterMs, message } on failure.
 */
async function callModel(apiKey, model, questionPayload) {
  const endpoint = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: questionPayload }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    // Parse Retry-After from Gemini's error body (looks like "17s")
    let retryAfterMs = 0;
    try {
      const errJson = JSON.parse(errText);
      const retryInfo = errJson?.error?.details?.find(
        (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
      );
      if (retryInfo?.retryDelay) {
        retryAfterMs = parseFloat(retryInfo.retryDelay) * 1000;
      }
    } catch { /* ignore parse errors */ }

    throw { status: response.status, retryAfterMs, message: errText };
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

/**
 * Try each model in the waterfall until one succeeds.
 * On 429, wait the suggested retryDelay before moving to the next model.
 */
async function askGemini(apiKey, questionPayload) {
  let lastError = null;

  for (const model of MODEL_WATERFALL) {
    try {
      console.info(`[AnswerIt] Trying model: ${model}`);
      const answer = await callModel(apiKey, model, questionPayload);
      console.info(`[AnswerIt] Success with model: ${model}`);
      return answer;
    } catch (err) {
      lastError = err;
      if (err.status === 429) {
        const waitMs = err.retryAfterMs || 5000;
        console.warn(
          `[AnswerIt] 429 on ${model}. Waiting ${waitMs}ms before next model…`
        );
        await new Promise((r) => setTimeout(r, waitMs));
        // Continue to next model in waterfall
      } else {
        // Non-quota error — fail immediately
        throw new Error(`Gemini API error ${err.status}: ${err.message}`);
      }
    }
  }

  // All models exhausted
  throw new Error(
    'All Gemini models are quota-limited right now. ' +
    'Free-tier daily limits reset at midnight Pacific Time. ' +
    'You can also enable billing at https://console.cloud.google.com to remove limits.'
  );
}

// Listen for messages from the content script / popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SOLVE_QUESTION') {
    const { apiKey, questionPayload } = message;

    if (!apiKey) {
      sendResponse({ success: false, error: 'API key is missing.' });
      return true;
    }

    askGemini(apiKey, questionPayload)
      .then((answer) => sendResponse({ success: true, answer }))
      .catch((err) => {
        console.error('[AnswerIt] Gemini error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // keep channel open for async response
  }
});
