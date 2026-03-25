import { BaseHighlighter } from './BaseHighlighter.js';

export class FreeTextHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        return optionEls.length === 0;
    }
    onMatch(element, lineIndex, matchedPairs) {
        // For free text there are typically no selectable option elements to match against.
        // It remains a no-op for highlighting/clicking predefined options.
    }
}
