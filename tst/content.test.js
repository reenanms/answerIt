/**
 * @jest-environment jsdom
 */

global.chrome = {
    runtime: {
        onMessage: { addListener: jest.fn() },
        sendMessage: jest.fn()
    },
    storage: {
        local: { get: jest.fn() }
    }
};

import { FormatDetector } from '../src/core/FormatDetector.js';
import { AnswerItApp } from '../src/core/AnswerItApp.js';
import { QuestionFormat } from '../src/core/QuestionFormat.js';

describe('answerIt refactored logic', () => {
    describe('FormatDetector', () => {
        let detector;
        beforeEach(() => {
            detector = new FormatDetector();
        });

        it('detects FreeText when no option elements', () => {
            const format = detector.detect('What is the capital of France?', []);
            expect(format).toBe(QuestionFormat.FreeText);
        });

        it('detects MultipleChoice when radio inputs are present', () => {
            document.body.innerHTML = `
        <div class="option"><input type="radio" /> Paris</div>
        <div class="option"><input type="radio" /> London</div>
      `;
            const options = Array.from(document.querySelectorAll('.option'));
            expect(detector.detect('What is the capital of France?', options)).toBe(QuestionFormat.MultipleChoice);
        });

        it('detects Multiselection when checkbox inputs are present', () => {
            document.body.innerHTML = `
        <div class="option"><input type="checkbox" /> Paris</div>
        <div class="option"><input type="checkbox" /> London</div>
      `;
            const options = Array.from(document.querySelectorAll('.option'));
            expect(detector.detect('Select all that apply:', options)).toBe(QuestionFormat.Multiselection);
        });

        it('throws an error if no specific inputs or formats matched', () => {
            document.body.innerHTML = `
        <div class="option">Paris</div>
        <div class="option">London</div>
      `;
            const options = Array.from(document.querySelectorAll('.option'));
            expect(() => detector.detect('What is...?', options)).toThrow('Could not identify the question format');
        });

        it('detects Matching if elements contain matching specific classes', () => {
            document.body.innerHTML = `
        <div class="match-row">Option 1</div>
        <div class="match-row">Option 2</div>
      `;
            const options = Array.from(document.querySelectorAll('.match-row'));
            const format = detector.detect('Match the following:', options);
            expect(format).toBe(QuestionFormat.Matching);
        });
    });

    describe('AnswerItApp payload builder', () => {
        it('builds a payload for FreeText correctly', () => {
            const app = new AnswerItApp({}, { selectors: { question: 'q', options: 'o' } });
            const payload = app.buildPayload(QuestionFormat.FreeText, 'Question 1?', []);
            expect(payload).toContain('Question Format: FreeText');
            expect(payload).toContain('Question 1?');
            expect(payload).not.toContain('Options:');
        });

        it('builds a payload for MultipleChoice correctly', () => {
            const app = new AnswerItApp({}, { selectors: { question: 'q', options: 'o' } });
            const payload = app.buildPayload(QuestionFormat.MultipleChoice, 'Capital of France?', ['Paris', 'London']);
            expect(payload).toContain('Question Format: MultipleChoice');
            expect(payload).toContain('Capital of France?');
            expect(payload).toContain('Options:');
            expect(payload).toContain('1. Paris');
            expect(payload).toContain('2. London');
        });
    });
});
