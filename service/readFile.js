const fs = require('fs');
const path = require('path');
const translationTools = require('./translate');

const process = async (source, destination) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const files = await fs.promises.readdir(source);

    let time = 0;
    for (const file of files) {
        const sourceFilePath = path.join(source, file);
        const destFilePath = path.join(destination, file);

        try {
            const stats = await fs.promises.stat(sourceFilePath);

            if (stats.isFile()) {
                const data = await fs.promises.readFile(sourceFilePath, 'utf8');
                const dataAfterTranslate = await translationTools(data, time);

                if (time === 3) {
                    time = 0;
                } else {
                    time++;
                }

                await fs.promises.writeFile(
                    destFilePath,
                    dataAfterTranslate,
                    'utf8'
                );
            }
        } catch (err) {
            console.error('Lỗi khi xử lý file:', err);
        }

        console.log('Xử lý xong file:', file);
    }

    console.log('Xử lý hoàn tất!');
};

module.exports = process;
