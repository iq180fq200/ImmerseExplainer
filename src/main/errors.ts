export class NoAPIKeyError extends Error {
    constructor() {
        super("No openAI API key is defined");
        this.name = "NoAPIKeyError"
    }
}