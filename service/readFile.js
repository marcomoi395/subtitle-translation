const fs = require('fs');
const path = require('path');
const SubtitleProcessor = require('./translate');
const AzureTranslator = require("./azureTranslator.service");
const vttToSrt = require("./convertVttToSrt");


const processFile = async (source, destination) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, {recursive: true});
    }

    const files = await fs.promises.readdir(source);
    console.log("Starting translation file...");


    for (const file of files) {
        const sourceFilePath = path.join(source, file);
        const destFilePath = path.join(destination, file);

        try {
            const stats = await fs.promises.stat(sourceFilePath);

            if (stats.isFile()) {
                let data = await fs.promises.readFile(sourceFilePath, 'utf8');

                if (path.extname(file).toLowerCase() === ".vtt")
                    data = vttToSrt(data);


                    // Translate the subtitle from ENG to VI
                    const translator = new AzureTranslator(process.env.SUBSCRIPTION_KEY, 'southeastasia');
                    const processor = new SubtitleProcessor(translator);
                    const translatedSubtitles = await processor.translateSubtitles(data, 'en', 'vi');

                    await fs.promises.writeFile(destFilePath, translatedSubtitles, 'utf8');
                }

            }
        catch
            (err)
            {
                console.error('Lỗi khi xử lý file:', err);
            }

            console.log('Xử lý xong file:', file);
        }

        console.log('Success!');
    }
    ;

    module.exports = processFile;
