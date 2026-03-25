import { BaseHighlighter } from './BaseHighlighter.js';

export class MatchingHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        return optionEls.some((el) => el.classList && el.classList.contains('match-row') || el.closest('.match-row'));
    }
    constructor(autoAnswer) {
        super(autoAnswer);
        this.matchingColors = [
            '#00FF00', '#FF00FF', '#00FFFF', '#FFA500', '#FF4500',
            '#8A2BE2', '#DC143C', '#1E90FF', '#32CD32', '#FFD700'
        ];
    }

    onMatch(element, lineIndex, matchedPairs) {
        if (!this.autoAnswer) {
            const highlightColor = this.matchingColors[lineIndex % this.matchingColors.length];
            this.applyHighlight(element, highlightColor);
        }
    }

    postProcess(matchedPairs) {
        if (this.autoAnswer) {
            let dndDelay = 0;
            Object.values(matchedPairs).forEach((pairElements) => {
                let promptEl = pairElements.find(e => e.closest('.match-prompt-label, .match-row') && !e.closest('.choices-container'));
                let choiceEl = pairElements.find(e => e.closest('.choices-container'));

                if (promptEl && choiceEl) {
                    let targetZone = promptEl.closest('.match-row')?.querySelector('.match-single-response-wrapper') || promptEl.closest('.match-row');
                    if (targetZone) {
                        setTimeout(() => this.simulateDragDrop(choiceEl, targetZone), dndDelay);
                        dndDelay += 500;
                    }
                }
            });
        }
    }

    async simulateDragDrop(sourceNode, targetNode) {
        const handle = sourceNode.closest('[data-react-beautiful-dnd-drag-handle]') || sourceNode;
        const sourceRect = handle.getBoundingClientRect();
        const targetRect = targetNode.getBoundingClientRect();

        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;

        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: startX, clientY: startY, button: 0 }));
        await new Promise(r => setTimeout(r, 200));

        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: startX + 10, clientY: startY + 10 }));
        await new Promise(r => setTimeout(r, 50));

        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: endX, clientY: endY }));
        await new Promise(r => setTimeout(r, 50));

        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: endX, clientY: endY, button: 0 }));
    }
}
