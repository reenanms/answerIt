/**
 * Centralized logger for the AnswerIt extension.
 * Adds a consistent [AnswerIt] prefix to all messages.
 */
export class Logger {
    static _prefix = '[AnswerIt]';

    /**
     * Log an info message.
     * @param {...*} args - Arguments to log.
     */
    static info(...args) {
        console.info(this._prefix, ...args);
    }

    /**
     * Log a general message.
     * @param {...*} args - Arguments to log.
     */
    static log(...args) {
        console.log(this._prefix, ...args);
    }

    /**
     * Log a warning message.
     * @param {...*} args - Arguments to log.
     */
    static warn(...args) {
        console.warn(this._prefix, ...args);
    }

    /**
     * Log an error message.
     * @param {...*} args - Arguments to log.
     */
    static error(...args) {
        console.error(this._prefix, ...args);
    }

    /**
     * Log a debug message.
     * @param {...*} args - Arguments to log.
     */
    static debug(...args) {
        console.debug(this._prefix, ...args);
    }
}
