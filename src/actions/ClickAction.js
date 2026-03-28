import { IAction } from './IAction.js';
import { Logger } from '../utils/Logger.js';

export class ClickAction extends IAction {
    constructor(config) {
        super();
        this.selector = config.selector;
    }

    async execute() {
        if (!this.selector) {
            throw new Error('ClickAction requires a "selector" in the configuration.');
        }

        const element = document.querySelector(this.selector);
        if (!element) {
            throw new Error(`Action failed: Could not find element with selector "${this.selector}".`);
        }
        Logger.log(`Clicking element: "${this.selector}"`);

        // Ensure element is in view (sometimes required for clicks)
        element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });

        // Try native click first
        element.click();

        // Fallback or supplementary events for complex apps
        const events = ['mousedown', 'mouseup', 'click'];
        events.forEach(evtType => {
            const event = new MouseEvent(evtType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            });
            element.dispatchEvent(event);
        });

        // Give a tiny bit of time for internal application handlers to process
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
