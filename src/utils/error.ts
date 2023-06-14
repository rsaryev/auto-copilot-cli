class BaseError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class LLMError extends BaseError {
    constructor(message: string) {
        super(message);
    }
}

export const throwLLMParseError = (): never => {
    throw new LLMError('Failed to parse the response from the LLM');
};
