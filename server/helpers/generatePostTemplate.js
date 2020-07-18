const ejs = require("ejs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const _ = require("lodash");
const uuid = require("uuid/v4");
const path = require("path");
const SocialPostTemplate = require("../models/socialPostTemplates");
const sharp = require("sharp");
const usdToXdc = require("../helpers/cmcHelper").usdToXdc;
// const gm = require("gm");

const UserFundReq = require("../models/userFundRequest");

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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 750,
      height: 510,
      deviceScaleFactor: 1,
    });
    await page.setContent(fileData);
    await page.screenshot({ path: imagePath });
    const postImage = fs.readFileSync(imagePath);
    const twitterImage = await sharp(postImage)
      .resize(750, 424, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      })
      .toFile(imagePath.split(".")[0] + "__twitter.png");
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
 *
 * @param {String} templateId the ID of the template to choose
 */
exports.generatePostImage_Multi = async (templateId) => {
  try {
    const vars = {};
    const template = await SocialPostTemplate.findOne({ id: templateId });
    let templatePath = template.templateFilePath;
    const templateVars = template.templateVars.split(",");
    for (let i = 0; i < templateVars.length; i++) {
      let currVar = templateVars[i];
      vars[currVar] = await calculateVariableValue(currVar);
    }

    const fileData = await ejs.renderFile(templatePath, { ...vars });
    let browser;
    const imagePath = eventFolder + "/" + uuid() + ".png";
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 750,
      height: 510,
      deviceScaleFactor: 1,
    });
    await page.setContent(fileData);
    await page.screenshot({ path: imagePath });
    const postImage = fs.readFileSync(imagePath);
    const twitterImage = await sharp(postImage)
      .resize(750, 424, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      })
      .toFile(imagePath.split(".")[0] + "__twitter.png");
    console.log(
      `[*] successfully ceated the new post from template: ${templateId}`
    );
    return imagePath;
  } catch (e) {
    console.log(`excepiotn at ${__filename}.generatePostImage_Multi:`, e);
    return null;
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

/**
 * improvized version of the old func. allows deducing of value from placeholder
 * eg: (\_\_count\_\_) name
 * @param {String} templateId id of the template on which event is based
 */
const generatePostStatus_Multi = async (templateId) => {
  try {
    if (_.isEmpty(templateId)) return null;
    const currTemplate = await SocialPostTemplate.findOne({ id: templateId });
    if (currTemplate === null) {
      console.error("[*] template not found, returning");
      return new Error(`Template with ID ${templateId} doers not exists`);
    }
    let templateStatus = currTemplate.templateStatus;
    let finalStatus = templateStatus;

    finalStatus = renderStatusMulti(finalStatus);
    return finalStatus;
  } catch (e) {
    console.log(`exception at ${__filename}.generatePostStatus_Multi:`, e);
    return null;
  }
};

/**
 * will parse the string & identify variables & calculate its value
 * @param {String} status template status
 */
async function renderStatusMulti(status) {
  try {
    let finalStatus = status;

    const allWords = status.split(" ");
    const vars = [],
      values = {};
    allWords.forEach((word) => {
      if (word.startsWith("__") && word.endsWith("__")) {
        vars.push(word);
      }
    });
    for (let i = 0; i < vars.length; i++) {
      let currVar = vars[i].replace(/__/g, "");
      const varValue = await calculateVariableValue(currVar);
      values[vars[i]] = varValue;
    }

    Object.keys(values).forEach((val) => {
      finalStatus = finalStatus.replace(
        new RegExp(`${val}`, "gi"),
        `${values[val].toFixed(2)}`
      );
    });
    return finalStatus;
  } catch (e) {
    console.log(`exception at ${__filename}.renderStatusMulti:`, e);
    return null;
  }
}

/**
 * @param {String} varName variable name
 */
async function calculateVariableValue(varName) {
  try {
    switch (varName) {
      /**
       * FMD variables
       */
      case "fmdApplicationsAll": {
        const applications = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: { $not: /^pending$/ } },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();

        return parseInt(applications.length);
      }
      case "fmdApplicationsPending": {
        const applications = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: "uninitiated" },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();

        return parseInt(applications.length);
      }
      case "fmdApplicationsFunded": {
        const applications = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: "completed" },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();
        return parseInt(applications.length);
      }
      case "fmdAmountAll": {
        const allFunds = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: { $not: /^pending$/ } },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();

        let tot = 0;

        for (let i = 0; i < allFunds.length; i++) {
          tot += parseFloat(allFunds[i].amountGoal);
        }

        return parseInt(tot);
      }
      case "fmdAmountPending": {
        const allFunds = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: "uninitiated" },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();

        let tot = 0;

        for (let i = 0; i < allFunds.length; i++) {
          tot += parseFloat(allFunds[i].amountGoal);
        }

        return parseInt(tot);
      }
      case "fmdAmountFunded": {
        const allFunds = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: "completed" },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();

        let tot = 0;

        for (let i = 0; i < allFunds.length; i++) {
          tot += parseFloat(allFunds[i].amountGoal);
        }

        return parseInt(tot);
      }

      case "fmdAmountPendingXdc": {
        const allFunds = await UserFundReq.find({
          $and: [
            {
              valid: true,
            },
            { status: "uninitiated" },
          ],
        })
          .select({ receiveAddrPrivKey: 0 })
          .lean();

        let tot = 0;

        for (let i = 0; i < allFunds.length; i++) {
          tot += parseFloat(allFunds[i].amountGoal);
        }

        const totXdc = await usdToXdc(tot);

        return parseInt(totXdc);
      }

      /**
       * Exam Variables
       */
    }
  } catch (e) {
    console.log(`exception at ${__filename}.calculateVariableValue:`, e);
    return null;
  }
}

exports.generatePostStatus_Multi = generatePostStatus_Multi;

// renderStatusMulti("this is a __fmd-amount-all__  __fmd-amount-all__ nice test!!").then(console.log);
// calculateVariableValue("fmdApplicationsPending").then(console.log);
