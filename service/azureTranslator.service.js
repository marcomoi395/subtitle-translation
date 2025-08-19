const axios = require('axios');
const crypto = require('crypto');

// Helper function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AzureTranslator {
    /**
     * Initializes the Azure Translator service client.
     * @param {string} apiKey - Your Azure Translator subscription key.
     * @param {string} region - The Azure region for your Translator resource (e.g., 'southeastasia').
     * @param {string} [endpoint='https://api.cognitive.microsofttranslator.com/'] - The Translator API endpoint.
     * @param {object} [retryOptions] - Options for retry logic.
     * @param {number} [retryOptions.maxRetries=10] - Maximum number of retries for 429 errors.
     * @param {number} [retryOptions.initialDelayMs=1000] - Initial delay in milliseconds for exponential backoff.
     * @param {number} [retryOptions.backoffFactor=2] - Factor to increase delay for exponential backoff.
     */
    constructor(
        apiKey,
        region,
        endpoint = 'https://api.cognitive.microsofttranslator.com/',
        retryOptions = {},
    ) {
        if (!apiKey || !region) {
            throw new Error(
                'Azure API Key and Region are required for AzureTranslator.',
            );
        }
        this.apiKey = apiKey;
        this.region = region;
        this.endpoint = endpoint;

        // --- Retry Logic Configuration ---
        this.maxRetries = retryOptions.maxRetries ?? 10;
        this.initialDelayMs = retryOptions.initialDelayMs ?? 1000;
        this.backoffFactor = retryOptions.backoffFactor ?? 2;
    }

    /**
     * Translates a single text string or an array of text strings.
     * @param {string|string[]} texts - The text or array of texts to translate.
     * @param {string} fromLang - The source language code (e.g., 'en').
     * @param {string} toLang - The target language code (e.g., 'vi').
     * @returns {Promise<string[]>} A promise that resolves to an array of translated texts.
     * @throws {Error} If translation fails after retries.
     */
    async translate(texts, fromLang, toLang) {
        const textsToTranslate = Array.isArray(texts) ? texts : [texts];
        if (textsToTranslate.length === 0) {
            return [];
        }

        // Prepare data payload for Azure API V3
        const requestData = textsToTranslate.map((text) => ({ Text: text }));

        let retries = 0;
        let currentDelay = this.initialDelayMs;

        while (retries <= this.maxRetries) {
            try {
                console.log(
                    `Attempting translation for ${textsToTranslate.length} segment(s) (Attempt ${retries + 1})...`,
                );
                const response = await axios({
                    baseURL: this.endpoint,
                    url: '/translate',
                    method: 'post',
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.apiKey,
                        'Ocp-Apim-Subscription-Region': this.region,
                        'Content-type': 'application/json',
                        'X-ClientTraceId': crypto.randomUUID(),
                    },
                    params: {
                        'api-version': '3.0',
                        from: fromLang,
                        to: toLang,
                    },
                    data: requestData,
                    responseType: 'json',
                });

                // --- Success ---
                // Extract translated text from response
                const translatedTexts = response.data.map(
                    (item) => item.translations[0].text,
                );

                console.log(
                    `Translation successful for ${translatedTexts.length} segment(s).`,
                );
                return translatedTexts; // Return array of translations
            } catch (err) {
                // --- Handle Errors ---
                if (
                    err.response &&
                    err.response.status === 429 && // Too Many Requests
                    retries < this.maxRetries
                ) {
                    retries++;
                    const retryAfterSeconds =
                        err.response.headers['retry-after'];
                    let waitTime = currentDelay;

                    if (retryAfterSeconds) {
                        // Use 'retry-after' header if available (value is in seconds)
                        // Add a small buffer (e.g., 100ms)
                        waitTime = parseInt(retryAfterSeconds, 10) * 1000 + 100;
                        console.warn(
                            `Received 429 Too Many Requests. Retrying after ${retryAfterSeconds} seconds (from header)...`,
                        );
                    } else {
                        // Use exponential backoff + jitter
                        console.warn(
                            `Received 429 Too Many Requests. Retrying after ${Math.round(waitTime / 1000)} seconds (exponential backoff)...`,
                        );
                        currentDelay *= this.backoffFactor;
                        // Add jitter (randomness up to 1 second)
                        waitTime += Math.random() * 1000;
                    }

                    await delay(waitTime); // Wait before retrying
                } else {
                    // Non-retryable error or max retries exceeded
                    console.error(
                        'Error during translation:',
                        err.response
                            ? `${err.response.status} - ${JSON.stringify(err.response.data)}`
                            : err.message,
                    );
                    const errorMsg = err.response
                        ? `Translation failed with status ${err.response.status}`
                        : `Translation failed: ${err.message}`;
                    throw new Error(errorMsg, { cause: err }); // Throw error to be caught by caller
                }
            }
        }

        // Should not be reached if loop condition is correct, but acts as a safeguard
        throw new Error(`Translation failed after ${this.maxRetries} retries.`);
    }
}

module.exports = AzureTranslator;
