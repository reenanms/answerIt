// Popup Script — handles settings persistence and triggering solve

import { Logger } from './utils/Logger.js';
import { DEFAULT_CONFIG } from './core/DefaultConfig.js';

const DEFAULT_CONFIG_STR = JSON.stringify(DEFAULT_CONFIG, null, 2);

// ─── DOM Elements ─────────────────────────────────────────────────────────────
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const selectorConfigTextarea = document.getElementById('selectorConfig');
const saveBtn = document.getElementById('saveBtn');
const solveBtn = document.getElementById('solveBtn');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');
const autoAnswerToggle = document.getElementById('autoAnswerToggle');

// Set placeholder dynamically so it stays in sync with DEFAULT_CONFIG
selectorConfigTextarea.placeholder = DEFAULT_CONFIG_STR;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showStatus(msg, type = 'info') {
  statusMsg.textContent = msg;
  statusMsg.className = `status-msg status-${type}`;
  statusMsg.style.display = 'block';

  if (type !== 'loading') {
    setTimeout(() => {
      statusMsg.style.display = 'none';
    }, 5000);
  }
}

/**
 * Sends a message to the content script, injecting it first if necessary.
 */
async function sendMessageToContentScript(tabId, message) {
  // Always try to ensure script is injected first.
  // The guard in content.js handles duplicates.
  try {
    Logger.log(`Ensuring content script is injected in tab ${tabId}...`);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['dist/content.js']
    });
    Logger.log('Injection successful or script already ready.');
    // Wait a tiny bit for the module and its dependencies to initialize
    await new Promise(r => setTimeout(r, 200));
  } catch (err) {
    Logger.warn('Injection failed or was prevented:', err.message);
    // Standard pages might fail injection if they are chrome:// or similar
    // but we'll proceed to try sending the message anyway.
  }

  const msgInfo = `type: ${message.type}${message.sequence ? ` (${message.sequence.length} steps)` : ''}`;
  Logger.log(`Dispatching message to tab ${tabId}: ${msgInfo}`);

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        Logger.error(`Message failed: ${msgInfo}. Error: ${errorMsg}`);
        resolve({ success: false, error: errorMsg });
      } else {
        Logger.log(`Response received for: ${msgInfo}`);
        resolve(response);
      }
    });
  });
}

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// ─── Load Saved Settings ──────────────────────────────────────────────────────

chrome.storage.local.get(['apiKey', 'selectorConfig', 'autoAnswer'], (result) => {
  if (result.apiKey) apiKeyInput.value = result.apiKey;
  selectorConfigTextarea.value = result.selectorConfig || DEFAULT_CONFIG_STR;
  autoAnswerToggle.checked = !!result.autoAnswer;
});

// ─── Toggle API Key Visibility ────────────────────────────────────────────────

toggleApiKeyBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  toggleApiKeyBtn.textContent = isPassword ? '🙈' : '👁️';
});

// ─── Save Settings ────────────────────────────────────────────────────────────

saveBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  const configStr = selectorConfigTextarea.value.trim();

  const autoAnswer = autoAnswerToggle.checked;

  if (!apiKey) {
    showStatus('⚠️ Please enter your API key before saving.', 'warn');
    return;
  }

  if (!isValidJson(configStr)) {
    showStatus('⚠️ Selector Config is not valid JSON.', 'warn');
    return;
  }

  chrome.storage.local.set({ apiKey, selectorConfig: configStr, autoAnswer }, () => {
    showStatus('✅ Settings saved successfully!', 'success');
  });
});

// ─── Solve Question ───────────────────────────────────────────────────────────

solveBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const configStr = selectorConfigTextarea.value.trim();

  const autoAnswer = autoAnswerToggle.checked;

  if (!apiKey) {
    showStatus('⚠️ API key is required. Please enter your Google AI Studio key.', 'warn');
    return;
  }

  if (!isValidJson(configStr)) {
    showStatus('⚠️ Selector Config is not valid JSON.', 'warn');
    return;
  }

  // Save current settings first
  await new Promise((resolve) =>
    chrome.storage.local.set({ apiKey, selectorConfig: configStr, autoAnswer }, resolve)
  );

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showStatus('❌ No active tab found.', 'error');
    return;
  }

  showStatus('⏳ Solving question…', 'loading');
  solveBtn.disabled = true;

  const response = await sendMessageToContentScript(tab.id, { type: 'TRIGGER_SOLVE' });
  solveBtn.disabled = false;

  if (response?.success) {
    showStatus(`✅ Answer found! Check the page highlight.`, 'success');
  } else {
    showStatus(`❌ ${response?.error ?? 'Unknown error'}`, 'error');
  }
});

// ─── Submit Answer ────────────────────────────────────────────────────────────

submitBtn.addEventListener('click', async () => {
  const configStr = selectorConfigTextarea.value.trim();

  if (!isValidJson(configStr)) {
    showStatus('⚠️ Selector Config is not valid JSON.', 'warn');
    return;
  }

  const config = JSON.parse(configStr);
  const sequence = config?.submitAction;

  if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
    showStatus('⚠️ No submitAction sequence found in the config.', 'warn');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showStatus('❌ No active tab found.', 'error');
    return;
  }

  submitBtn.disabled = true;
  const response = await sendMessageToContentScript(tab.id, { type: 'TRIGGER_SEQUENCE', sequence });
  submitBtn.disabled = false;

  if (response?.success) {
    showStatus('✅ Submitted!', 'success');
  } else {
    showStatus(`❌ ${response?.error ?? 'Unknown error'}`, 'error');
  }
});
