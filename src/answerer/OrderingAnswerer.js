import { BaseAnswerer } from './BaseAnswerer.js';

export class OrderingAnswerer extends BaseAnswerer {
    onAnswer(element) {
        const clickable = element;
        clickable.click();
    }
}
