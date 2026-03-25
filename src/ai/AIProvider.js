export class AIProvider {
    /**
     * Solves the given question payload. Must be implemented by subclasses.
     * @param {string} payload 
     * @returns {Promise<string>}
     */
    async solve(payload) {
        throw new Error('solve() must be implemented in subclasses.');
    }
}
