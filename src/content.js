import { BackgroundAIProvider } from './ai/BackgroundAIProvider.js';
import { AnswerItApp } from './core/AnswerItApp.js';

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['selectorConfig', 'autoAnswer'], (result) => {
      let config;
      try {
        config = result.selectorConfig ? JSON.parse(result.selectorConfig) : null;
      } catch {
        config = null;
      }

      if (!config || !config.selectors) {
        config = {
          name: 'McGraw-Hill Default',
          selectors: {
            question: '.prompt, .question-content, .q-text',
            options: '.choice-row, .match-prompt-label, .choice-item-wrapper:not(.-placeholder), .answer-option, .choice-label',
            container: '.probe-container, .question-wrapper'
          }
        };
      }
      config.autoAnswer = !!result.autoAnswer;
      resolve(config);
    });
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TRIGGER_SOLVE') {
    getConfig().then(config => {
      const provider = new BackgroundAIProvider();
      const app = new AnswerItApp(provider, config);
      return app.solve();
    }).then(sendResponse).catch(err => {
      console.error('[AnswerIt] Unexpected error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});
