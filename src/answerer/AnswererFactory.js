import { QuestionFormat } from '../core/QuestionFormat.js';
import { MultipleChoiceAnswerer } from './MultipleChoiceAnswerer.js';
import { MultiselectionAnswerer } from './MultiselectionAnswerer.js';
import { OrderingAnswerer } from './OrderingAnswerer.js';
import { MatchingAnswerer } from './MatchingAnswerer.js';
import { FreeTextAnswerer } from './FreeTextAnswerer.js';

export class AnswererFactory {
    static create(format) {
        switch (format) {
            case QuestionFormat.FreeText: return new FreeTextAnswerer();
            case QuestionFormat.Matching: return new MatchingAnswerer();
            case QuestionFormat.Multiselection: return new MultiselectionAnswerer();
            case QuestionFormat.Ordering: return new OrderingAnswerer();
            case QuestionFormat.MultipleChoice: return new MultipleChoiceAnswerer();
            default:
                throw new Error(`Unsupported answerer format: ${format}`);
        }
    }
}
