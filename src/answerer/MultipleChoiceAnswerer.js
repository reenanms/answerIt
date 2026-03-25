import { BaseAnswerer } from './BaseAnswerer.js';

export class MultipleChoiceAnswerer extends BaseAnswerer {
    onAnswer(element) {
        const clickable = element.querySelector('input[type="radio"]') || element;
        clickable.click();
    }
}
