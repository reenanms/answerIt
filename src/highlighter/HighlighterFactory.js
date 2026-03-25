import { MatchingHighlighter } from './MatchingHighlighter.js';
import { MultipleChoiceHighlighter } from './MultipleChoiceHighlighter.js';
import { MultiselectionHighlighter } from './MultiselectionHighlighter.js';
import { OrderingHighlighter } from './OrderingHighlighter.js';
import { FreeTextHighlighter } from './FreeTextHighlighter.js';
import { QuestionFormat } from '../core/QuestionFormat.js';

export class HighlighterFactory {
    static create(format) {
        switch (format) {
            case QuestionFormat.FreeText: return new FreeTextHighlighter();
            case QuestionFormat.Matching: return new MatchingHighlighter();
            case QuestionFormat.Multiselection: return new MultiselectionHighlighter();
            case QuestionFormat.Ordering: return new OrderingHighlighter();
            case QuestionFormat.MultipleChoice: return new MultipleChoiceHighlighter();
            default:
                throw new Error(`Unsupported highlighter format: ${format}`);
        }
    }
}
