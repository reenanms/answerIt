import { BaseHighlighter } from './BaseHighlighter.js';

export class MultiselectionHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        return optionEls.some(el => el.querySelector('input[type="checkbox"]') || el.closest('label, div, form, fieldset')?.querySelector('input[type="checkbox"]'));
    }
    onMatch(element, lineIndex, matchedPairs) {
        if (this.autoAnswer) {
            const clickable = element.querySelector('input[type="checkbox"]') || element;
            clickable.click();
        } else {
            this.applyHighlight(element, '#00FF00');
        }
    }
}
