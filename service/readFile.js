const fs = require('fs');
const path = require('path');
const translationTools = require('./translate');

const process = async (source, destination) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }


    fs.readdir(source, (err, files) => {
        if (err) {
            console.error('Lỗi khi đọc thư mục:', err);
            return;
        }

        files.forEach(file => {
            const sourceFilePath = path.join(source, file);
            const destFilePath = path.join(destination, file);

            // Kiểm tra xem đó có phải là file không (bỏ qua thư mục)
            fs.stat(sourceFilePath, (err, stats) => {
                if (err) {
                    console.error('Lỗi khi đọc thông tin file:', err);
                    return;
                }

                if (stats.isFile()) {
                    // Đọc nội dung của file
                    fs.readFile(sourceFilePath, 'utf8', async (err, data) => {
                        if (err) {
                            console.error('Lỗi khi đọc file:', err);
                            return;
                        }

                        const res = await translationTools(data);
                        // console.log(res);

                        // Lưu lại nội dung đã sửa đổi vào file
                        fs.writeFile(destFilePath, res, 'utf8', (err) => {
                            if (err) {
                                console.error('Lỗi khi ghi file:', err);
                            }
                        });
                    });
                }
            });
        });
    });
}

module.exports = process;

