import { BaseHighlighter } from './BaseHighlighter.js';

export class MultipleChoiceHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        return optionEls.some(el => el.querySelector('input[type="radio"]') || el.closest('label, div, form, fieldset')?.querySelector('input[type="radio"]'));
    }
    onMatch(element, lineIndex, matchedPairs) {
        if (this.autoAnswer) {
            const clickable = element.querySelector('input[type="radio"]') || element;
            clickable.click();
        } else {
            this.applyHighlight(element, '#00FF00');
        }
    }
}
