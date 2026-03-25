import { BaseHighlighter } from './BaseHighlighter.js';

export class MultiselectionHighlighter extends BaseHighlighter {
    onMatch(element, lineIndex, matchedPairs) {
        if (this.autoAnswer) {
            const clickable = element.querySelector('input[type="checkbox"]') || element;
            clickable.click();
        } else {
            this.applyHighlight(element, '#00FF00');
        }
    }
}
