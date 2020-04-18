const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const rootPath = "server/funder-certi/";

let renderFunderCerti = (donerName, fundId) => {
  try {

    ejs.renderFile(
      path.join(__dirname, "../fmd-templates/funder-certi/ThankYou.ejs"),
      { donerName },
      async (err, data) => {
        let imgHTML = data.toString("utf-8");        
        browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const localPath = "server/funder-certis/" +fundId + ".png";
        const page = await browser.newPage();
        await page.setViewport({
          width: 800,
          height: 600,
          deviceScaleFactor: 1,
        });
        await page.setContent(imgHTML);
        await page.screenshot({ path: localPath });
      }
    );
  } catch (e) {
    console.log(`exception at ${__filename}.renderFunderCerti: `, e);
    return null;
  }
};

renderFunderCerti("Rudresh Solanki", "test")
