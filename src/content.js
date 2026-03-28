import { BackgroundAIProvider } from './ai/BackgroundAIProvider.js';
import { AnswerItApp } from './core/AnswerItApp.js';
import { ActionSequenceExecutor } from './actions/ActionSequenceExecutor.js';
import { DEFAULT_CONFIG } from './core/DefaultConfig.js';
import { ToastService } from './ui/ToastService.js';
import { Logger } from './utils/Logger.js';

if (!window.answerItInjected) {
  window.answerItInjected = true;

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
          config = { ...DEFAULT_CONFIG };
        }
        config.autoAnswer = !!result.autoAnswer;
        resolve(config);
      });
    });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    Logger.log(`Received message of type: ${message.type}`);
    if (message.type === 'TRIGGER_SOLVE') {
      getConfig().then(config => {
        const provider = new BackgroundAIProvider();
        const app = new AnswerItApp(provider, config);
        return app.solve();
      }).then(res => {
        Logger.log('TRIGGER_SOLVE finished. Sending response.');
        sendResponse(res);
      }).catch(err => {
        Logger.error('Unexpected error:', err);
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }

    if (message.type === 'TRIGGER_SEQUENCE') {
      const { sequence } = message;
      Logger.log('Received TRIGGER_SEQUENCE message.');
      const executor = new ActionSequenceExecutor();
      executor.executeSequence(sequence)
        .then(res => {
          Logger.log('TRIGGER_SEQUENCE finished. Sending response.');
          sendResponse(res);
        })
        .catch(err => {
          Logger.error('Sequence error:', err);
          sendResponse({ success: false, error: err.message });
        });
      return true;
    }
  });
}
