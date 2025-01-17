const translate = require('@vitalets/google-translate-api');
const azureTranslator = require('./azureTranslator.service');

const translateUtils = async function translateText(inputText) {
    try {
        const { text } = await translate.translate(inputText, { to: 'vi' });
        return { text };
    } catch (error) {
        console.error(error);
    }
};

const parseSubtitle = (data) => {
    let subtitles = [];
    let dialogues = [];
    const lines = data.trim().split('\n');

    const timestampRegex =
        /\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/;
    for (let i = 0; i < lines.length; i++) {
        if (timestampRegex.test(lines[i].trim())) {
            let temp = [lines[i].trim()];
            i++;
            let text = '';
            while (i < lines.length && lines[i].trim() !== '') {
                text += lines[i] + '\n';
                i++;
            }
            temp.push(text.trim());
            dialogues.push(text);
            subtitles.push(temp);
        }
    }
    return { subtitles, dialogues };
};

const translationTools = async (data, time) => {
    const { subtitles, dialogues } = parseSubtitle(data.trim());

    let dataAfterTranslation = await azureTranslator(
        dialogues.join(` | `),
        'en',
        'vi',
        time
    );

    dataAfterTranslation = dataAfterTranslation.split('|');

    const formattedTranslations = dataAfterTranslation.map((item, index) => {
        return `${index}\n${subtitles[index][0]}\n${item.trim()}`;
    });

    return formattedTranslations.join('\n\n');
};

module.exports = translationTools;
