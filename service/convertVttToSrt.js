/**
 * Chuyển đổi nội dung chuỗi định dạng VTT sang định dạng SRT.
 *
 * @param {string} vttContent Nội dung file VTT dưới dạng chuỗi.
 * @returns {string} Nội dung file SRT dưới dạng chuỗi.
 */
function vttToSrt(vttContent) {
    if (!vttContent || typeof vttContent !== 'string') {
        return '';
    }

    let srtContent = '';
    let cueCounter = 1;

    const blocks = vttContent.trim().split(/\r?\n\r?\n/);

    for (const block of blocks) {
        const lines = block.trim().split(/\r?\n/);

        if (
            lines.length === 0 ||
            lines[0].trim() === '' ||
            lines[0].trim() === 'WEBVTT' ||
            lines[0].trim().startsWith('NOTE')
        ) {
            continue;
        }

        let timestampLine = '';
        let textStartIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                timestampLine = lines[i];
                textStartIndex = i + 1;
                break;
            }
        }

        if (!timestampLine || textStartIndex === -1) {
            // Bỏ qua nếu không tìm thấy timestamp hợp lệ
            continue;
        }

        const timeRegex =
            /(?:(\d{1,2}):)?(\d{2}:\d{2}\.\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}:\d{2}\.\d{3})/;
        const match = timestampLine.match(timeRegex);

        if (match) {
            const startHours = match[1] ? match[1].padStart(2, '0') : '00';
            const startRest = match[2].replace('.', ',');
            const endHours = match[3] ? match[3].padStart(2, '0') : '00';
            const endRest = match[4].replace('.', ',');

            const srtTimestamp = `${startHours}:${startRest} --> ${endHours}:${endRest}`;
            const textLines = lines.slice(textStartIndex).join('\n');

            srtContent += `${cueCounter}\n`;
            srtContent += `${srtTimestamp}\n`;
            srtContent += `${textLines}\n\n`;

            cueCounter++;
        }
    }

    return srtContent.trim();
}

module.exports = vttToSrt;
