import { GeminiProvider } from './ai/GeminiProvider.js';
import { Logger } from './utils/Logger.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SOLVE_QUESTION') {
    const { apiKey, questionPayload } = message;

    if (!apiKey) {
      sendResponse({ success: false, error: 'API key is missing.' });
      return true;
    }

    const aiProvider = new GeminiProvider(apiKey);
    aiProvider.solve(questionPayload)
      .then((answer) => sendResponse({ success: true, answer }))
      .catch((err) => {
        Logger.error('AI error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['dist/content.js']
    });
  } catch { }

  if (command === 'solve-question') {
    Logger.log('Command "solve-question" received.');
    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SOLVE' });
  }

  if (command === 'submit-and-next') {
    chrome.storage.local.get(['selectorConfig'], (result) => {
      let config = null;
      try {
        config = result.selectorConfig ? JSON.parse(result.selectorConfig) : null;
      } catch { }

      const sequence = config?.submitAction;
      if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
        Logger.error('submit-and-next: No sequence found in configuration.');
        return;
      }

      Logger.log(`Dispatching TRIGGER_SEQUENCE (${sequence.length} steps).`);
      chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SEQUENCE', sequence });
    });
  }
});

