const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const he = require('he');
const { successLogger, errorLogger } = require('./logger');
const axios = require('axios');

getContentHtml = async (url) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'request'
            },
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
                // successLogger.info(`API call successful: ${url}`);

            } else {
                reject(error);
                console.log('error', error);
                errorLogger.error(`API call failed: ${url}`);
            }
        });
    });
}

proxyScrapeHtml = async (url) => {
    return new Promise((resolve, reject) => {
        let data = JSON.stringify({
            url: url,
            httpResponseBody: true
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.proxyscrape.com/v3/accounts/freebies/scraperapi/request',
            headers: { 
                'Content-Type': 'application/json', 
                'X-Api-Key': 'ed1a660a-7dd8-4306-a217-78e1915cb5da'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                if (response.data.data.browserHtml) {
                    resolve(response.data.data.browserHtml);
                } else {
                    resolve(Buffer.from(response.data.data.httpResponseBody, 'base64').toString());
                }
            }).catch((error) => {
                reject(error);
                console.log(error);
            });
    })
}

getDetailBook = (htmlContent) => {
    const book = {
        attributes: [],
        description: '',
        averageRating: '',
        totalRating: '',
        product_name: '',
    }
    // Phân tích cú pháp HTML bằng cheerio
    const $ = cheerio.load(htmlContent);

    // Lấy thông tin tiêu đề sách
    book.product_name = $('.product-essential .h1').text().trim();

    $('.data-table.table-additional tr').each((index, element) => {
        const key = $(element).find('th').text().replace(/\n|\t/g, '').trim();
        const value = $(element).find('td').text().replace(/\n|\t/g, '').trim();
        if(key) {
            book.attributes.push({ key, value });
        }
    });


    const descriptions = [];
    $('#desc_content p').each((index, element) => {
        const description = $(element).text().trim();
        if(description) {
            descriptions.push(description);
        }
    });

    book.description = descriptions.join('\n');

    // get avarage rating
    book.averageRating = $('.product-essential .ratings-mobile .icon-star-text').text().trim();
    book.totalRating = $('.product-essential .ratings-mobile .rating-links > a').text().trim();
    if (book.totalRating) {
        book.totalRating = book.totalRating.slice(1, book.totalRating.length - 1);
    }
    return book;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    getContentHtml,
    getDetailBook,
    sleep,
    proxyScrapeHtml
}