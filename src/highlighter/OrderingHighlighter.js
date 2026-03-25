import { BaseHighlighter } from './BaseHighlighter.js';

export class OrderingHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        const texts = Array.from(optionEls).map((el) => el.textContent.trim().toLowerCase());
        return texts.some((t) => /^\d+[.)]\s/.test(t));
    }
}
