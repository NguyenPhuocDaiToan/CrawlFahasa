const fs = require('fs');
const { getContentHtml, getDetailBook, sleep, proxyScrapeHtml } = require('./utils/util');
const { successLogger, errorLogger } = require('./utils/logger');

async function main() {
  const start = 20000;
  const end = 30000;
  const json = fs.readFileSync("src/data/data.json");
  const data = JSON.parse(json);
  const products = data.product_list;
  
  for (let i = start; i < end; i++) {
    console.log(`Get product index = ${i}, url = `, products[i].product_url);

    try {
      const htmlContent = await getContentHtml(products[i].product_url);
      const book = getDetailBook(htmlContent);
      Object.keys(book).forEach(key => {
        products[i][key] = book[key];
      });
      await sleep(600);

      if(i % 200 === 0 || i === end - 1) {
        fs.writeFile(`src/data/data_detail_${start}_${end}.json`, JSON.stringify(products.slice(start, end)), (error) => {
          if (error) {
            errorLogger.error("data_detail.json written failed");
            throw error;
          }

          successLogger.info("data_detail.json written correctly");
        });
      }
    } catch (error) {
      console.log('error', error);
      errorLogger.error('Crawl fail tại: ' + i);
    }
  }
  successLogger.info("Finish fetching data detail");
}

main();
