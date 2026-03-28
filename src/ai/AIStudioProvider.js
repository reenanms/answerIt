import { AIProvider } from './AIProvider.js';
import { Logger } from '../utils/Logger.js';

export class AIStudioProvider extends AIProvider {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
    }

    async solve(payload) {
        Logger.info('Stubbed AI Studio Provider solving...');
        // Real implementation would go here
        return "AI Studio logic is pluggable here.";
    }
}
