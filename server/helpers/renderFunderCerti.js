const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const rootPath = path.join(__dirname, "../../dist/img/funder-certi/");

if (!fs.existsSync(rootPath)) {
  fs.mkdirSync(rootPath);
}

/**
 * will render the thank you certificate
 * @param {String} donerName doner name
 * @param {String} fundId funder name
 */
let renderFunderCerti = (donerName, fundId) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(
      path.join(__dirname, "../fmd-templates/funder-certi/ThankYou.ejs"),
      { donerName },
      async (err, data) => {
        try {
          if (err) {
            console.log(`exception at ${__filename}.renerFunderCerti: `, err);
            reject(err);
          }
          let imgHTML = data.toString("utf-8");
          browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });
          const localPath = rootPath + fundId + ".png";
          const page = await browser.newPage();
          await page.setViewport({
            width: 800,
            height: 600,
            deviceScaleFactor: 1,
          });
          await page.setContent(imgHTML);
          await page.screenshot({ path: localPath });
          resolve({ status: true });
        } catch (e) {
          console.log(`exception at ${__filename}.renderFunderCerti: `, e);
          reject(e);
        }
      }
    );
  });
};

exports.renderFunderCerti = renderFunderCerti;