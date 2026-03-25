import { BaseHighlighter } from './BaseHighlighter.js';

export class MultiselectionHighlighter extends BaseHighlighter {
    static canHandle(optionEls) {
        return optionEls.some(el => el.querySelector('input[type="checkbox"]') || el.closest('label, div, form, fieldset')?.querySelector('input[type="checkbox"]'));
    }
}
