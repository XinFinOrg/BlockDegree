const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode");
const crypto = require("crypto");
const puppeteer = require("puppeteer");
const ejs = require("ejs");

const rootPath = path.join(
  __dirname,
  "../../dist/img/funders/corporate/logos/"
);

const rootPathDummy = path.join(
  __dirname,
  "../../dist/img/funders/corporate/dummy-certi/"
);

if (!fs.existsSync(path.join(__dirname, "../../dist/img/funders/corporate/"))) {
  console.log("[*] creating directory: ", rootPath);
  fs.mkdirSync(path.join(__dirname, "../../dist/img/funders/corporate/"));
  fs.mkdirSync(rootPath);
  fs.mkdirSync(rootPathDummy);
}

exports.SaveCorporateLogo = async (id, b64) => {
  try {
    fs.writeFileSync(rootPath + id + ".png", b64,"base64");
    return true;
  } catch (e) {
    console.log(`exception at ${__filename}.SaveCorporateLogo: `, e);
    return null;
  }
};

async function renderCorporateDummy(companyName, uniqueId) {
  try {
    let newDate = new Date();
    let ts = newDate.getTime();
    let date = newDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const dataURL = await qrcode.toDataURL(companyName);
    const imgHTML = await ejs.renderFile(__dirname + "/certificateWithQR.ejs", {
      rndDgt: crypto.randomBytes(32).toString("hex"),
      name: "John Doe",
      course: "Certified Blockchain Professional Expert",
      courseSub: "Blockchain Certificate",
      topic: "Blockchain",
      subTopic: "Basic Course For Engineers",
      score: Math.round(parseFloat("80")) + "",
      date: date,
      dataURL: dataURL,
      ts: ts,
      examType: "professional",
      donerName: "",
      type: "corporate",
      corpId: uniqueId,
    });

    console.log("IMGhtml: ", imgHTML);
    

    let localPath =
      `dist/img/funders/corporate/dummy-certi/` +
      uniqueId +
      `.png`;
    let browser;

    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 800,
      height: 600,
      deviceScaleFactor: 1,
    });
    await page.setContent(imgHTML);
    await page.screenshot({ path: localPath });
    return true;
  } catch (e) {
    console.log(`exception at ${__filename}.renderCorporateDummy: `, e);
    return false;
  }
}

exports.RenderCorporateDummy = renderCorporateDummy;
