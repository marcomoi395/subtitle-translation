const AzureTranslator = require('./azureTranslator.service'); // Assuming AzureTranslator.js is in the same directory

class SubtitleProcessor {
    /**
     * Initializes the Subtitle Processor.
     * @param {AzureTranslator} translatorInstance - An instance of the AzureTranslator class.
     */
    constructor(translatorInstance) {
        if (!(translatorInstance instanceof AzureTranslator)) {
            throw new Error(
                'An instance of AzureTranslator is required for SubtitleProcessor.',
            );
        }
        this.translator = translatorInstance;

        // Regular expressions for parsing timestamps (adjust if needed)
        // Original format: 001:00:00,000 --> 00:00:05,000 (Note: first part might have 3 digits for hours?)
        // V3 format:       001:00:00.000 --> 00:00:05.000
        // Let's make it slightly more general
        this.timestampRegex =
            /^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}$/;
    }

    /**
     * Parses a subtitle file content string (specific format assumed).
     * @param {string} data - The raw string content of the subtitle file.
     * @returns {{ originalSubtitles: { index: number, timestamp: string, originalText: string }[], dialogues: string[] }}
     * An object containing the structured original subtitles and an array of dialogue lines.
     * @private
     */
    _parseSubtitle(data) {
        let originalSubtitles = [];
        let dialogues = [];
        const lines = data.trim().split('\n');

        for (let i = 1; i < lines.length; i++) {
            if (this.timestampRegex.test(lines[i].trim())) {
                originalSubtitles.push([lines[i].trim()]);
                i++;
                let text = '';
                while (i < lines.length && lines[i].trim() !== '') {
                    text += lines[i] + '\n';
                    i++;
                }
                dialogues.push(text);
            }
        }

        return { originalSubtitles, dialogues };
    }

    /**
     * Formats the translated subtitles back into the standard SRT-like format.
     * @param {{ index: number, timestamp: string, originalText: string }[]} originalSubtitles - The parsed original structure.
     * @param {string[]} translatedDialogues - The array of translated text lines.
     * @returns {string} The formatted subtitle string.
     * @throws {Error} If the number of original and translated dialogues doesn't match.
     * @private
     */
    _formatSubtitle(originalSubtitles, translatedDialogues) {
        if (originalSubtitles.length !== translatedDialogues.length) {
            throw new Error(
                `Mismatch in subtitle counts: ${originalSubtitles.length} original vs ${translatedDialogues.length} translated.`,
            );
        }

        const formattedLines = originalSubtitles.map((sub, index) => {
            const translatedText = translatedDialogues[index] || ''; // Handle potential empty translations
            return `${index + 1}\n${sub}\n${translatedText.trim()}`;
        });

        return formattedLines.join('\n\n'); // Standard SRT block separator
    }

    /**
     * Parses subtitle data, translates dialogues, and formats the result.
     * @param {string} subtitleData - The raw string content of the subtitle file.
     * @param {string} fromLang - The source language code (e.g., 'en').
     * @param {string} toLang - The target language code (e.g., 'vi').
     * @param {number} [conditionalTimeParam] - The 'time' parameter from the original code. Its purpose is unclear
     * in the context of API retries, but included here if needed.
     * It triggers a delay *after* successful translation if equal to 3.
     * @returns {Promise<string>} A promise that resolves to the formatted translated subtitle string.
     */
    async translateSubtitles(subtitleData, fromLang, toLang) {
        const { originalSubtitles, dialogues } = this._parseSubtitle(
            subtitleData.trim(),
        );

        if (dialogues.length === 0) {
            console.warn('No dialogues found to translate.');
            return ''; // Return empty string or original data as appropriate
        }

        // Translate all dialogues in one batch call (more efficient)
        const translatedDialogues = await this.translator.translate(
            dialogues,
            fromLang,
            toLang,
        );

        // Format the subtitles with the translated text
        return this._formatSubtitle(
            originalSubtitles,
            translatedDialogues,
        );
    }
}

module.exports = SubtitleProcessor;
