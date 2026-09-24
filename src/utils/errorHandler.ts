export const parseApiError = (data: any, defaultMessage = "An unexpected error occurred.") => {
    // If it's already just a string, return it
    if (typeof data === 'string') return data;
    
    // If it's empty or not an object, return default
    if (!data || typeof data !== 'object') return defaultMessage;

    // Check for standard custom backend errors
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    // Handle Django REST Framework field validation arrays 
    // e.g. {"username": ["Enter a valid username."]}
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
        if (Array.isArray(data[firstKey])) {
            return data[firstKey][0]; // Extracts the first string from the array
        } else if (typeof data[firstKey] === 'string') {
            return data[firstKey];
        }
    }

    return defaultMessage;
};``