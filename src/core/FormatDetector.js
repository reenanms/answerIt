import { QuestionFormat } from './QuestionFormat.js';

import { FreeTextHighlighter } from '../highlighter/FreeTextHighlighter.js';
import { MatchingHighlighter } from '../highlighter/MatchingHighlighter.js';
import { MultiselectionHighlighter } from '../highlighter/MultiselectionHighlighter.js';
import { MultipleChoiceHighlighter } from '../highlighter/MultipleChoiceHighlighter.js';
import { OrderingHighlighter } from '../highlighter/OrderingHighlighter.js';

export class FormatDetector {
    static detect(optionEls) {
        if (FreeTextHighlighter.canHandle(optionEls)) return QuestionFormat.FreeText;
        if (MatchingHighlighter.canHandle(optionEls)) return QuestionFormat.Matching;
        if (MultiselectionHighlighter.canHandle(optionEls)) return QuestionFormat.Multiselection;
        if (MultipleChoiceHighlighter.canHandle(optionEls)) return QuestionFormat.MultipleChoice;
        if (OrderingHighlighter.canHandle(optionEls)) return QuestionFormat.Ordering;

        throw new Error('Could not identify the question format from the available options.');
    }
}
