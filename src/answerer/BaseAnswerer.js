export class BaseAnswerer {
    answer(matchedPairs) {
        Object.entries(matchedPairs).forEach(([lineIndexStr, elements]) => {
            const lineIndex = parseInt(lineIndexStr, 10);
            elements.forEach((el) => {
                this.onAnswer(el, lineIndex, matchedPairs);
            });
        });
        this.postProcess(matchedPairs);
    }

    onAnswer(element, lineIndex, matchedPairs) {
        throw new Error('onAnswer must be implemented by subclasses');
    }

    postProcess(matchedPairs) {
        // Option to override
    }
}
