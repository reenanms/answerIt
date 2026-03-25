import { BaseHighlighter } from './BaseHighlighter.js';

export class OrderingHighlighter extends BaseHighlighter {
    onMatch(element, lineIndex, matchedPairs) {
        if (this.autoAnswer) {
            // For ordering, basic click mechanism. DND implementation can be expanded later.
            const clickable = element;
            clickable.click();
        } else {
            // Highlight each ordered item with distinct colors or generic green
            this.applyHighlight(element, '#00FF00');
        }
    }
}
