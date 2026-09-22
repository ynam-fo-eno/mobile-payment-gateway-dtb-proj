import { parseApiError } from '../../src/utils/errorHandler';

// "describe" blocks group related tests together
describe('parseApiError utility', () => {
    
    // "it" blocks define a specific scenario you want to test
    it('returns the string exactly if passed a simple string', () => {
        const result = parseApiError("Network connection failed.");
        // "expect" is where you assert what the result SHOULD be
        expect(result).toBe("Network connection failed.");
    });

    it('extracts the exact sentence from a Django field array error', () => {
        const djangoError = { 
            "username": ["Enter a valid username.", "This field is required."] 
        };
        const result = parseApiError(djangoError);
        expect(result).toBe("Enter a valid username.");
    });

    it('returns standard error or detail keys if present', () => {
        const customError = { "error": "Insufficient funds." };
        expect(parseApiError(customError)).toBe("Insufficient funds.");
    });

    it('returns the fallback message if the object is empty or unhandled', () => {
        const emptyError = {};
        const result = parseApiError(emptyError, "Default fallback message");
        expect(result).toBe("Default fallback message");
    });
});