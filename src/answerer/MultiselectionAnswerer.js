import { BaseAnswerer } from './BaseAnswerer.js';

export class MultiselectionAnswerer extends BaseAnswerer {
    onAnswer(element) {
        const clickable = element.querySelector('input[type="checkbox"]') || element;
        clickable.click();
    }
}
