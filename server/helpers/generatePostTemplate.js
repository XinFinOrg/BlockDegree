const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const _ = require("lodash");
const uuid = require("uuid/v4");
const path = require("path");
const SocialPostTemplate = require("../models/socialPostTemplates");
const sharp  = require("sharp");
const gm = require("gm");

const eventFolder = path.join(__dirname, "../tmp-event");
const postTemplatePath = path.join(__dirname, "../postTemplates");
if (!fs.existsSync(postTemplatePath)) {
  console.log("[*] template folder does not exists, creating...");
  fs.mkdirSync(postTemplatePath);
}

/**
 * GeneratePostImage dynamixally genrates the post-image based on type & count
 * @param {string} type the type of the event - certifcates, accounts, visits, one-time event
 * @param {string} count the count of the variable
 * @param {string} [templateId] the ID of the template to choose; will override the one selected by default based on type
 * @returns {string} returns the path of the social post image
 */
exports.generatePostImage = async (type, count, templateId) => {
  console.log("Parameters: ", type, count, templateId);
  let templatePath = "";
  if (!_.isEmpty(templateId)) {
    console.log(
      `[*] template id has been supplied, looking up the template ${templateId}`
    );
    const currTemplate = await SocialPostTemplate.findOne({ id: templateId });
    if (currTemplate === null) {
      console.error("[*] template not found, returning");
      return new Error(`Template with ID ${templateId} doers not exists`);
    }
    templatePath = currTemplate.templateFilePath;
  }
  if (templatePath === "") {
    // templateId provided, select any one.
    const rndTemplate = await SocialPostTemplate.findOne({ eventType: type });
    if (rndTemplate === null) {
      console.error(`[*]  no compatible templates found, quiting...`);
      return new Error("No complatible template found.");
    }
    templatePath = rndTemplate.templateFilePath;
  }
  console.log(`Using template at the path ${templatePath}`);
  try {
    const fileData = await ejs.renderFile(templatePath, { count: count });
    let browser;
    const imagePath = eventFolder + "/" + uuid() + ".png";
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 750,
      height: 510,
      deviceScaleFactor: 1
    });
    await page.setContent(fileData);
    await page.screenshot({ path: imagePath });
    const postImage = fs.readFileSync(imagePath);
    const twitterImage = await sharp(postImage).resize(750, 424, {fit:"contain"}).toFile(imagePath.split(".")[0]+"__twitter.png");
    // gm(imagePath).resize(750, 400, '^').write(imagePath.split(".")[0]+"__twitter.png",err => {
    //   console.log("Err: at generatePostTemplate ", err)
    // } );
    console.log(
      `[*] successfully ceated the new post from template: ${templateId}`
    );
    return imagePath;
  } catch (browserException) {
    console.error(
      `[*] browserException at generatePostTemplate: `,
      browserException
    );
    return new Error(JSON.stringify(browserException));
  }
};

/**
 * GeneratePostStatus will generate the status for post based on the tmeplate.
 * @param {string} type event type {"certificates", "accounts","visits"}
 * @param {number} count count variable for the post
 * @param {string} [templateId] the ID of the template to choose; will override the one selected by default based on type
 * @returns {string} returns the post status
 */
exports.generatePostStatus = async (type, count, templateId) => {
  console.log(`called generatePostStatus`);
  console.log(type, count, templateId);
  let templateStatus = "";
  if (!_.isEmpty(templateId)) {
    console.log(
      `[*] template id has been supplied, looking up the template ${templateId}`
    );
    const currTemplate = await SocialPostTemplate.findOne({ id: templateId });
    if (currTemplate === null) {
      console.error("[*] template not found, returning");
      return new Error(`Template with ID ${templateId} doers not exists`);
    }
    templateStatus = currTemplate.templateStatus;
  }
  if (templateStatus === "") {
    // templateId provided, select any one.
    const rndTemplate = await SocialPostTemplate.findOne({ eventType: type });
    if (rndTemplate === null) {
      console.error(`[*]  no compatible templates found, quiting...`);
      return new Error("No complatible template found.");
    }
    templateStatus = rndTemplate.templateStatus;
  }
  console.log(`selected template status: ${templateStatus}`);
  templateStatus = templateStatus.replace("__count__", count);
  console.log("updated template status: ", templateStatus);
  return templateStatus;
};
