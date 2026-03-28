/**
 * Service for showing toast notifications on the page.
 */
export class ToastService {
    /**
     * Shows a toast notification.
     * @param {string} message The message to display.
     * @param {'success' | 'error' | 'loading' | 'info'} type The type of toast.
     * @param {boolean} matched Whether the answer was matched (only for success type).
     */
    static showToast(message, type = 'success', matched = false) {
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
        } else if (type === 'info') {
            prefix = 'ℹ️ ';
            bg = '#1a1a2e';
            border = '#007BFF';
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
