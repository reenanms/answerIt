import { GeminiProvider } from './ai/GeminiProvider.js';

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
        console.error('[AnswerIt] AI error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'solve-question') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['dist/content.js']
      });
    } catch { }

    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SOLVE' });
  }
});
