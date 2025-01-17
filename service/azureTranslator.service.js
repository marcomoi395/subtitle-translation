const axios = require('axios');

// Thông tin API từ Azure Portal
const endpoint = 'https://api.cognitive.microsofttranslator.com/';
const region = 'southeastasia'; // Ví dụ: 'eastus'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = async function translateText(text, fromLang, toLang, time) {
    try {
        const response = await axios({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
                'Ocp-Apim-Subscription-Region': region,
                'Content-type': 'application/json',
            },
            params: {
                'api-version': '3.0',
                from: fromLang,
                to: toLang,
            },
            data: [
                {
                    Text: text,
                },
            ],
            responseType: 'json',
        });

        if (time === 3) {
            await delay(10000); // Giới hạn tốc độ dịch
        }

        // Trả về kết quả dịch nếu thành công
        return response.data[0].translations[0].text;
    } catch (err) {
        console.error('Error:', err.message || err);
        throw new Error('Translation failed. Please try again.');
    }
};
