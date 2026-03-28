export class IAction {
    /**
     * Executes the specific action.
     * @returns {Promise<void>}
     */
    async execute() {
        throw new Error('Method "execute()" must be implemented by subclasses.');
    }
}
