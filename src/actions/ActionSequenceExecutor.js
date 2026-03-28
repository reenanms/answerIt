import { ActionFactory } from './ActionFactory.js';
import { Logger } from '../utils/Logger.js';
import { ToastService } from '../ui/ToastService.js';

export class ActionSequenceExecutor {
    /**
     * @param {Function} showToastFn - A callback function to show toast messages: (message, type) => void.
     *                                 Use AnswerItApp.showToast.bind(app) or any compatible function.
     */
    constructor() {
    }

    /**
     * Executes an array of action configs sequentially.
     * If any action fails, the sequence stops and shows a toast error.
     * @param {object[]} sequenceConfig - Array of action config objects.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async executeSequence(sequenceConfig) {
        Logger.log('Starting sequence execution with', sequenceConfig.length, 'actions.');
        if (!Array.isArray(sequenceConfig) || sequenceConfig.length === 0) {
            const errMsg = 'ActionSequenceExecutor: Sequence configuration must be a non-empty array.';
            ToastService.showToast(errMsg, 'error');
            return { success: false, error: errMsg };
        }

        for (const config of sequenceConfig) {
            try {
                const action = ActionFactory.create(config);
                await action.execute();
                Logger.log(`Action step completed successfully.`);
            } catch (error) {
                Logger.error('Sequence aborted:', error.message);
                ToastService.showToast(error.message, 'error');
                return { success: false, error: error.message };
            }
        }

        return { success: true };
    }
}
