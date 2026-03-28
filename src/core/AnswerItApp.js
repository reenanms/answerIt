import { QuestionExtractor } from './QuestionExtractor.js';
import { FormatDetector } from './FormatDetector.js';
import { AnswerMatcher } from './AnswerMatcher.js';
import { HighlighterFactory } from '../highlighter/HighlighterFactory.js';
import { AnswererFactory } from '../answerer/AnswererFactory.js';
import { ToastService } from '../ui/ToastService.js';
import { Logger } from '../utils/Logger.js';

export class AnswerItApp {
    constructor(aiProvider, config) {
        this.aiProvider = aiProvider;
        this.config = config;
        this.extractor = new QuestionExtractor(config.selectors);
    }

    async solve() {
        ToastService.showToast('Solving question...', 'loading');
        try {
            const { questionText, optionEls, optionTexts } = this.extractor.extract();
            const format = FormatDetector.detect(optionEls);

            const payload = this.buildPayload(format, questionText, optionTexts);
            Logger.info('Format:', format);
            Logger.info('Payload:\n', payload);

            const answer = await this.aiProvider.solve(payload);

            const { matched, matchedPairs } = AnswerMatcher.match(optionEls, answer);

            if (matched) {
                const highlighter = HighlighterFactory.create(format);
                highlighter.highlight(matchedPairs);

                if (this.config.autoAnswer) {
                    const answerer = AnswererFactory.create(format);
                    answerer.answer(matchedPairs);
                }
            }

            ToastService.showToast(answer, 'success', matched);
            return { success: true, answer };
        } catch (err) {
            Logger.error('Error:', err);
            ToastService.showToast(err.message, 'error');
            return { success: false, error: err.message };
        }
    }

    buildPayload(format, questionText, optionTexts) {
        let payload = `Question Format: ${format}\n\nQuestion:\n${questionText}\n`;
        if (optionTexts.length > 0) {
            payload += '\nOptions:\n';
            optionTexts.forEach((t, i) => { payload += `${i + 1}. ${t}\n`; });
        }
        return payload;
    }
}
