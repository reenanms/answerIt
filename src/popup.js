// Popup Script — handles settings persistence and triggering solve

const DEFAULT_CONFIG = JSON.stringify(
  {
    name: 'McGraw-Hill Default',
    selectors: {
      question: '.prompt',
      options: '.choice-row',
      container: '.probe-container'
    }
  },
  null,
  2
);

// ─── DOM Elements ─────────────────────────────────────────────────────────────
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const selectorConfigTextarea = document.getElementById('selectorConfig');
const saveBtn = document.getElementById('saveBtn');
const solveBtn = document.getElementById('solveBtn');
const statusMsg = document.getElementById('statusMsg');

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

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// ─── Load Saved Settings ──────────────────────────────────────────────────────

chrome.storage.local.get(['apiKey', 'selectorConfig'], (result) => {
  if (result.apiKey) apiKeyInput.value = result.apiKey;
  selectorConfigTextarea.value = result.selectorConfig || DEFAULT_CONFIG;
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

  if (!apiKey) {
    showStatus('⚠️ Please enter your API key before saving.', 'warn');
    return;
  }

  if (!isValidJson(configStr)) {
    showStatus('⚠️ Selector Config is not valid JSON.', 'warn');
    return;
  }

  chrome.storage.local.set({ apiKey, selectorConfig: configStr }, () => {
    showStatus('✅ Settings saved successfully!', 'success');
  });
});

// ─── Solve Question ───────────────────────────────────────────────────────────

solveBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const configStr = selectorConfigTextarea.value.trim();

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
    chrome.storage.local.set({ apiKey, selectorConfig: configStr }, resolve)
  );

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    showStatus('❌ No active tab found.', 'error');
    return;
  }

  showStatus('⏳ Solving question…', 'loading');
  solveBtn.disabled = true;

  try {
    // Inject the content script dynamically (works on any tab via scripting API)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch {
    // Content script may already be injected — that's fine
  }

  // Send trigger message to the content script
  chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SOLVE' }, (response) => {
    solveBtn.disabled = false;

    if (chrome.runtime.lastError) {
      showStatus(
        `❌ Could not connect to page: ${chrome.runtime.lastError.message}`,
        'error'
      );
      return;
    }

    if (response?.success) {
      showStatus(`✅ Answer found! Check the page highlight.`, 'success');
    } else {
      showStatus(`❌ ${response?.error ?? 'Unknown error'}`, 'error');
    }
  });
});
