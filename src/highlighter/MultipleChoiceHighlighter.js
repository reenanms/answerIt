import { BaseHighlighter } from './BaseHighlighter.js';

export class MultipleChoiceHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        return optionEls.some(el => el.querySelector('input[type="radio"]') || el.closest('label, div, form, fieldset')?.querySelector('input[type="radio"]'));
    }
}
