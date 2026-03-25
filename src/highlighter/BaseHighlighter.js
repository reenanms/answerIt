export class BaseHighlighter {
    constructor(autoAnswer) {
        this.autoAnswer = autoAnswer;
    }

    highlight(matchedPairs) {
        Object.entries(matchedPairs).forEach(([lineIndexStr, elements]) => {
            const lineIndex = parseInt(lineIndexStr, 10);
            elements.forEach((el) => {
                this.onMatch(el, lineIndex, matchedPairs);
            });
        });
        this.postProcess(matchedPairs);
    }

    onMatch(element, lineIndex, matchedPairs) {
        throw new Error('onMatch must be implemented by subclasses');
    }

    postProcess(matchedPairs) {
        // No-op for base highlighter
    }

    applyHighlight(element, color) {
        element.style.outline = `4px solid ${color}`;
        element.style.borderRadius = '4px';
        element.style.transition = 'outline 0.2s ease';
    }
}
