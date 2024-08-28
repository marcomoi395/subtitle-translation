const translate = require('@vitalets/google-translate-api');

const translateUtils = async function translateText(inputText) {
    try {
        const { text } = await translate.translate(inputText, { to: 'vi' });
        return { text };
    } catch (error) {
        console.error(error);
    }
}

const translationTools = async (data) => {
    const regex = /(\d+)\r?\n([\d:,]+ --> [\d:,]+)\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n$)/g;

    const dialogues = [];
    let match;

    while ((match = regex.exec(data)) !== null) {
        // match[3] chứa lời thoại
        dialogues.push(match[3].trim());
    }

    // console.log(dialogues.join('\\\\'))
    let dataAfterTranslation = await translateUtils(dialogues.join(`\n`));
    dataAfterTranslation = dataAfterTranslation.text.split("\n")

    const blocks = data.trim().split(/\n\s*\n/);

    const updatedBlocks = blocks.map((block, index) => {
        const lines = block.split('\n');
        if (lines.length > 2) {
            lines[2] = dataAfterTranslation[index];
        }
        return lines.join('\n');
    });

    return updatedBlocks.join('\n\n');
}

module.exports = translationTools;
