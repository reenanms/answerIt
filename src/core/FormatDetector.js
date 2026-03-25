import { QuestionFormat } from './QuestionFormat.js';

export class FormatDetector {
    detect(questionText, optionEls) {
        const count = optionEls.length;
        if (count === 0) return QuestionFormat.FreeText;

        const texts = Array.from(optionEls).map((el) =>
            el.textContent.trim().toLowerCase()
        );

        const isMatching = optionEls.some(
            (el) => el.classList && el.classList.contains('match-row') || el.closest('.match-row')
        );
        if (isMatching) return QuestionFormat.Matching;

        const hasCheckboxes = optionEls.some(el =>
            el.querySelector('input[type="checkbox"]') || el.closest('label, div, form, fieldset')?.querySelector('input[type="checkbox"]')
        );
        if (hasCheckboxes) return QuestionFormat.Multiselection;

        const hasRadios = optionEls.some(el =>
            el.querySelector('input[type="radio"]') || el.closest('label, div, form, fieldset')?.querySelector('input[type="radio"]')
        );
        if (hasRadios) return QuestionFormat.MultipleChoice;

        const hasOrdinals = texts.some((t) => /^\d+[.)]\s/.test(t));
        if (hasOrdinals) return QuestionFormat.Ordering;

        throw new Error('Could not identify the question format from the available options.');
    }
}
