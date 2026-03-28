import { IAction } from './IAction.js';
import { Logger } from '../utils/Logger.js';

export class WaitAction extends IAction {
    constructor(config) {
        super();
        this.time = config.time;
    }

    async execute() {
        if (typeof this.time !== 'number' || this.time < 0) {
            throw new Error('WaitAction requires a valid "time" (non-negative number) in the configuration.');
        }

        Logger.log(`Waiting for ${this.time}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.time));
        Logger.log(`Wait finished.`);
    }
}
