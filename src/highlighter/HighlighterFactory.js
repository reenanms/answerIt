import { MatchingHighlighter } from './MatchingHighlighter.js';
import { MultipleChoiceHighlighter } from './MultipleChoiceHighlighter.js';
import { MultiselectionHighlighter } from './MultiselectionHighlighter.js';
import { OrderingHighlighter } from './OrderingHighlighter.js';
import { FreeTextHighlighter } from './FreeTextHighlighter.js';
import { QuestionFormat } from '../core/QuestionFormat.js';

export class HighlighterFactory {
    static create(format, autoAnswer) {
        switch (format) {
            case QuestionFormat.FreeText: return new FreeTextHighlighter(autoAnswer);
            case QuestionFormat.Matching: return new MatchingHighlighter(autoAnswer);
            case QuestionFormat.Multiselection: return new MultiselectionHighlighter(autoAnswer);
            case QuestionFormat.Ordering: return new OrderingHighlighter(autoAnswer);
            case QuestionFormat.MultipleChoice: return new MultipleChoiceHighlighter(autoAnswer);
            default:
                throw new Error(`Unsupported question format: ${format}`);
        }
    }
}
