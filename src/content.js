// Content Script — scrapes questions, detects format, highlights answers

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Read the selector config from storage.
 * Falls back to the McGraw-Hill default config.
 */
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['selectorConfig'], (result) => {
      let config;
      try {
        config = result.selectorConfig
          ? JSON.parse(result.selectorConfig)
          : null;
      } catch {
        config = null;
      }

      // Default McGraw-Hill config
      if (!config || !config.selectors) {
        config = {
          name: 'McGraw-Hill Default',
          selectors: {
            question: '.question-content, .q-text',
            options: '.answer-option, .choice-label',
            container: '.question-wrapper'
          }
        };
      }
      resolve(config);
    });
  });
}

/**
 * Detect the question format based on available DOM elements / text.
 * Supported: MultipleChoice, TrueFalse, Multiselection, Ordering, FreeText
 */
function detectFormat(questionText, optionEls) {
  const count = optionEls.length;
  if (count === 0) return 'FreeText';

  const texts = Array.from(optionEls).map((el) =>
    el.textContent.trim().toLowerCase()
  );

  const isTF =
    count === 2 && texts.includes('true') && texts.includes('false');
  if (isTF) return 'TrueFalse';

  // Ordering hint: options often contain "1." / "a." / ordinal markers
  const hasOrdinals = texts.some((t) => /^\d+[.)]\s/.test(t));
  if (hasOrdinals) return 'Ordering';

  // Multiselection hint: look for checkboxes
  const hasCheckboxes = optionEls[0]
    ?.closest('form, fieldset')
    ?.querySelector('input[type="checkbox"]');
  if (hasCheckboxes) return 'Multiselection';

  return 'MultipleChoice';
}

/**
 * Build a formatted payload string to send to Gemini.
 */
function buildPayload(format, questionText, optionTexts) {
  let payload = `Question Format: ${format}\n\nQuestion:\n${questionText}\n`;

  if (optionTexts.length > 0) {
    payload += '\nOptions:\n';
    optionTexts.forEach((t, i) => {
      payload += `${i + 1}. ${t}\n`;
    });
  }

  return payload;
}

/**
 * Apply answer highlight to matching option elements.
 * Highlights any option whose trimmed text is included in the AI answer.
 */
function highlightAnswer(optionEls, answer) {
  const answerLower = answer.toLowerCase();
  let matched = false;

  optionEls.forEach((el) => {
    const text = el.textContent.trim().toLowerCase();
    if (answerLower == text) {
      el.style.outline = '4px solid #00FF00';
      el.style.borderRadius = '4px';
      el.style.transition = 'outline 0.2s ease';
      matched = true;
    }
  });

  return matched;
}

// ─── Main Solve Logic ─────────────────────────────────────────────────────────

async function solveQuestion() {
  const config = await getConfig();
  const { question: qSel, options: optSel } = config.selectors;

  // Grab question text
  const questionEl = document.querySelector(qSel);
  if (!questionEl) {
    console.warn('[AnswerIt] Question element not found. Selector:', qSel);
    return { success: false, error: 'Question element not found on this page.' };
  }
  const questionText = questionEl.innerText.trim();

  // Grab options
  const optionEls = Array.from(document.querySelectorAll(optSel));
  const optionTexts = optionEls.map((el) => el.textContent.trim());

  const format = detectFormat(questionText, optionEls);
  const questionPayload = buildPayload(format, questionText, optionTexts);

  console.info('[AnswerIt] Format:', format);
  console.info('[AnswerIt] Payload:\n', questionPayload);

  // Retrieve API key
  const { apiKey } = await new Promise((resolve) =>
    chrome.storage.local.get(['apiKey'], resolve)
  );

  if (!apiKey) {
    return { success: false, error: 'API key not set. Please configure it in the extension popup.' };
  }

  // Ask background script to call Gemini
  const response = await new Promise((resolve) =>
    chrome.runtime.sendMessage(
      { type: 'SOLVE_QUESTION', apiKey, questionPayload },
      resolve
    )
  );

  if (!response?.success) {
    console.error('[AnswerIt] AI error:', response?.error);
    return { success: false, error: response?.error ?? 'Unknown AI error.' };
  }

  const answer = response.answer;
  console.info('[AnswerIt] Answer:', answer);

  const matched = highlightAnswer(optionEls, answer);

  // Show an on-page toast with the answer
  showToast(answer, matched);

  return { success: true, answer };
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function showToast(message, matched) {
  // Remove existing toast if any
  const existing = document.getElementById('ai-solver-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'ai-solver-toast';
  toast.textContent = matched
    ? `✅ Answer: ${message}`
    : `💡 AI Answer: ${message}`;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    maxWidth: '420px',
    padding: '14px 18px',
    background: matched ? '#1a1a2e' : '#2d1b00',
    color: '#fff',
    border: `2px solid ${matched ? '#00FF00' : '#FFA500'}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    lineHeight: '1.5',
    transition: 'opacity 0.4s ease'
  });

  document.body.appendChild(toast);

  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 8000);
}

// ─── Message Listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TRIGGER_SOLVE') {
    solveQuestion()
      .then(sendResponse)
      .catch((err) => {
        console.error('[AnswerIt] Unexpected error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // keep channel open
  }
});
