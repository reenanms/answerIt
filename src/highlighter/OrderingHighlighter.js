import { BaseHighlighter } from './BaseHighlighter.js';

export class OrderingHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        const texts = Array.from(optionEls).map((el) => el.textContent.trim().toLowerCase());
        return texts.some((t) => /^\d+[.)]\s/.test(t));
    }
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
