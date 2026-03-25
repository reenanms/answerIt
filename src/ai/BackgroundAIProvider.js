import { AIProvider } from './AIProvider.js';

export class BackgroundAIProvider extends AIProvider {
    async solve(payload) {
        const { apiKey } = await new Promise((resolve) =>
            chrome.storage.local.get(['apiKey'], resolve)
        );

        if (!apiKey) {
            throw new Error('API key not set. Please configure it in the extension popup.');
        }

        const response = await new Promise((resolve) =>
            chrome.runtime.sendMessage(
                { type: 'SOLVE_QUESTION', apiKey, questionPayload: payload },
                resolve
            )
        );

        if (!response?.success) {
            throw new Error(response?.error ?? 'Unknown AI error.');
        }

        return response.answer;
    }
}
