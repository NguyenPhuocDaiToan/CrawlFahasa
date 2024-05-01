const request = require('request');
const fs = require('fs');

function callAPI(query) {
    return new Promise((resolve, reject) => {
        request({
        method: 'GET',
        url: `https://www.fahasa.com/fahasa_catalog/product/loadproducts?${new URLSearchParams(query)}`,
        headers: {
            'User-Agent': 'request'
        }
    }, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.parse(body));
        });
    });
};

async function main() {
    // https://www.fahasa.com/fahasa_catalog/product/loadproducts?category_id=3165&currentPage=2&limit=24&order=num_orders&series_type=0
    const query = {
        category_id: 3165,
        currentPage: 1,
        limit: 1,
        order: 'num_orders_month',
        series_type: 0
    };
    
    const firstRequest = await callAPI(query);
    query.limit = firstRequest.total_products;

    console.log('Start fetching data...', query);

    const result = await callAPI(query);

    if(result) {
        // writing the JSON string content to a file
        fs.writeFile("src/data/data_foreign.json", JSON.stringify(result), (error) => {
        // throwing the error
        // in case of a writing problem
        if (error) {
            // logging the error
            console.error(error);

            throw error;
        }

        console.log("data.json written correctly");
        });
    }
}

main();
