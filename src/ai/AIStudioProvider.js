import { AIProvider } from './AIProvider.js';

export class AIStudioProvider extends AIProvider {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
    }

    async solve(payload) {
        console.info('[AnswerIt] Stubbed AI Studio Provider solving...');
        // Real implementation would go here
        return "AI Studio logic is pluggable here.";
    }
}
