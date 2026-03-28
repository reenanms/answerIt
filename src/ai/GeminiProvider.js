import { AIProvider } from './AIProvider.js';
import { Logger } from '../utils/Logger.js';

export class GeminiProvider extends AIProvider {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.models = ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash'];
        this.systemPrompt =
            'You are an academic assistant. I will provide a question and options from a textbook. ' +
            'Your task is to return ONLY the correct answer text. If it is an ordering question, ' +
            'provide the sequence. If it is free text, provide a concise answer. ' +
            'For a "Matching" question format, pair the terms with their definitions and return each pair on a new line separated by a hyphen. ' +
            'For multiple choice or multiselection, return EXACTLY the text of the correct option(s), ' +
            'one per line. Do NOT include option numbers (like "1."), bullet points, or any conversational filler.';
    }

    async solve(payload) {
        for (const model of this.models) {
            try {
                Logger.info(`Trying model: ${model}`);
                return await this._callModel(model, payload);
            } catch (err) {
                if (err.status === 429) {
                    const waitMs = err.retryAfterMs || 5000;
                    Logger.warn(`429 on ${model}. Waiting ${waitMs}ms before next model…`);
                    await new Promise((r) => setTimeout(r, waitMs));
                } else {
                    throw new Error(`Gemini API error ${err.status}: ${err.message}`);
                }
            }
        }
        throw new Error('All Gemini models are quota-limited right now.');
    }

    async _callModel(model, payload) {
        const endpoint = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
        const body = {
            systemInstruction: { parts: [{ text: this.systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: payload }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            let retryAfterMs = 0;
            try {
                const errJson = JSON.parse(errText);
                const retryInfo = errJson?.error?.details?.find(
                    (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
                );
                if (retryInfo?.retryDelay) {
                    retryAfterMs = parseFloat(retryInfo.retryDelay) * 1000;
                }
            } catch { }
            throw { status: response.status, retryAfterMs, message: errText };
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    }
}
