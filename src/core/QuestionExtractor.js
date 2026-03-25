export class QuestionExtractor {
    constructor(configSelectors) {
        this.qSel = configSelectors.question;
        this.optSel = configSelectors.options;
    }

    extract() {
        const questionEl = document.querySelector(this.qSel);
        if (!questionEl) {
            throw new Error('Question element not found on this page.');
        }
        const questionText = questionEl.innerText.trim();

        const optionEls = Array.from(document.querySelectorAll(this.optSel));
        const optionTexts = optionEls.map((el) => el.textContent.trim());

        return { questionText, optionEls, optionTexts };
    }
}
