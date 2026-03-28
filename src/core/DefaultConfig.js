export const DEFAULT_CONFIG = {
    name: 'McGraw-Hill Default',
    selectors: {
        question: '.prompt, .question-content, .q-text',
        options: '.choice-row, .match-prompt-label, .choice-item-wrapper:not(.-placeholder), .answer-option, .choice-label',
        container: '.probe-container, .question-wrapper'
    },
    submitAction: [
        { action: 'click', selector: '[data-automation-id="confidence-buttons--high_confidence"]' },
        { action: 'wait', time: 500 },
        { action: 'click', selector: '.next-button' }
    ]
};
