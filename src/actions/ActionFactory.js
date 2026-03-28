import { ClickAction } from './ClickAction.js';
import { WaitAction } from './WaitAction.js';

export class ActionFactory {
    /**
     * Creates an IAction instance based on the config object.
     * To add a new action type, import its class and add a new case to the switch.
     * @param {object} config - The action configuration object (e.g., { action: "click", selector: "..." })
     * @returns {IAction}
     */
    static create(config) {
        if (!config || !config.action) {
            throw new Error('Invalid action configuration: Missing "action" property.');
        }

        switch (config.action.toLowerCase()) {
            case 'click':
                return new ClickAction(config);
            case 'wait':
                return new WaitAction(config);
            default:
                throw new Error(`ActionFactory: Unsupported action type "${config.action}".`);
        }
    }
}
