export class AnswerMatcher {
    match(optionEls, answer) {
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
                if (!matchedPairs[matchedLineIndex]) {
                    matchedPairs[matchedLineIndex] = [];
                }
                matchedPairs[matchedLineIndex].push(el);
            }
        });

        return { matched, matchedPairs };
    }
}
