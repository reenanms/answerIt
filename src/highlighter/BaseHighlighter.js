export class BaseHighlighter {
    constructor(autoAnswer) {
        this.autoAnswer = autoAnswer;
    }

    process(optionEls, answer) {
        const answerLower = answer.toLowerCase();
        let matched = false;

        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const lines = answerLower.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        const matchedPairs = {};

        optionEls.forEach((el, index) => {
            const text = el.textContent.trim().toLowerCase();
            if (!text) return;

            let isMatch = false;
            let matchedLineIndex = 0;

            if (answerLower === text) {
                isMatch = true;
            } else {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    let cleanLine = line.replace(/^([0-9]+[\.\)]|[\-\*]|option\s*[0-9]+[\.\)]?)\s*/, '').trim();

                    if (line === text || cleanLine === text) {
                        isMatch = true;
                        matchedLineIndex = i;
                        break;
                    }

                    const stringIndex = `${index + 1}`;
                    if (line === stringIndex || line === `${stringIndex}.` || line === `${stringIndex})` || line === `option ${stringIndex}`) {
                        isMatch = true;
                        matchedLineIndex = i;
                        break;
                    }

                    if (text.length >= 2) {
                        let found = false;
                        try {
                            const regex = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(text)}($|[^\\p{L}\\p{N}])`, 'iu');
                            if (regex.test(line) || regex.test(cleanLine)) found = true;
                        } catch (e) {
                            const fallbackRegex = new RegExp(`(^|\\W)${escapeRegex(text)}($|\\W)`, 'i');
                            if (fallbackRegex.test(line) || fallbackRegex.test(cleanLine)) found = true;
                        }
                        if (found) {
                            isMatch = true;
                            matchedLineIndex = i;
                            break;
                        }
                    }
                }
            }

            if (isMatch) {
                matched = true;
                this.onMatch(el, matchedLineIndex, matchedPairs);
            }
        });

        this.postProcess(matchedPairs);
        return matched;
    }

    onMatch(element, lineIndex, matchedPairs) {
        if (this.autoAnswer) {
            const clickable = element.querySelector('input[type="radio"], input[type="checkbox"]') || element;
            clickable.click();
        } else {
            this.applyHighlight(element, '#00FF00');
        }
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
