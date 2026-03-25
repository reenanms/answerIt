import { QuestionExtractor } from './QuestionExtractor.js';
import { FormatDetector } from './FormatDetector.js';
import { BaseHighlighter } from '../highlighter/BaseHighlighter.js';
import { MatchingHighlighter } from '../highlighter/MatchingHighlighter.js';

export class AnswerItApp {
    constructor(aiProvider, config) {
        this.aiProvider = aiProvider;
        this.config = config;
        this.extractor = new QuestionExtractor(config.selectors);
        this.formatDetector = new FormatDetector();
    }

    async solve() {
        this.showToast('Solving question...', 'loading');
        try {
            const { questionText, optionEls, optionTexts } = this.extractor.extract();
            const format = this.formatDetector.detect(questionText, optionEls);

            const payload = this.buildPayload(format, questionText, optionTexts);
            console.info('[AnswerIt] Format:', format);
            console.info('[AnswerIt] Payload:\n', payload);

            const answer = await this.aiProvider.solve(payload);

            const highlighter = this.getHighlighter(format, this.config.autoAnswer);
            const matched = highlighter.process(optionEls, answer);

            this.showToast(answer, 'success', matched);
            return { success: true, answer };
        } catch (err) {
            console.error('[AnswerIt] Error:', err);
            this.showToast(err.message, 'error');
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

    getHighlighter(format, autoAnswer) {
        if (format === 'Matching') {
            return new MatchingHighlighter(autoAnswer);
        }
        return new BaseHighlighter(autoAnswer);
    }

    showToast(message, type = 'success', matched = false) {
        const existing = document.getElementById('ai-solver-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'ai-solver-toast';

        let bg = '#1a1a2e';
        let border = '#00FF00';
        let prefix = '';

        if (type === 'loading') {
            prefix = '⏳ ';
            bg = '#222222';
            border = '#007BFF';
        } else if (type === 'error') {
            prefix = '❌ Error: ';
            bg = '#3d1010';
            border = '#FF3333';
        } else if (type === 'success') {
            prefix = matched ? '✅ Answer: ' : '💡 AI Answer: ';
            bg = matched ? '#1a1a2e' : '#2d1b00';
            border = matched ? '#00FF00' : '#FFA500';
        }

        toast.textContent = `${prefix}${message}`;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '2147483647',
            maxWidth: '420px',
            padding: '14px 18px',
            background: bg,
            color: '#fff',
            border: `2px solid ${border}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            lineHeight: '1.5',
            transition: 'opacity 0.4s ease'
        });

        document.body.appendChild(toast);

        if (type !== 'loading') {
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 400);
            }, 8000);
        }
    }
}
