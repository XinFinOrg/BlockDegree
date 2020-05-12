const EventEmitter = require("events").EventEmitter;
const User = require("../models/user");
const UserReferral = require("../models/userReferral");
const { genRandomAlphaNum } = require("../helpers/common");

const em = new EventEmitter();

/**
 *
 * @param {String} code referral code used
 * @param {String} email user email id
 */
async function referralUsage(code, email) {
  try {
    console.log("called referralUsage");    
    const referred = await UserReferral.findOne({ referralCode: code });
    if (referred === null) {
      return console.log("[*] code not found");
    }
    referred.registrations.push(email);
    await referred.save();
    console.log("saved");    
  } catch (e) {
    console.log(`exceptionat ${__filename}.referralUsage: `, e);
  }
}

function createUserReferral(email) {
  setImmediate(async () => {
    try {
      let refExists = await UserReferral.findOne({ email: email });
      if (refExists !== null) {
        return false;
      }
      let refCode = genRandomAlphaNum();
      refExists = await UserReferral.findOne({ referralCode: refCode });
      if (refExists !== null) {
        let newRefCode = genRandomAlphaNum();
        while (newRefCode === refCode) {
          newRefCode = genRandomAlphaNum();
        }
        refCode = newRefCode;
      }
      const newCode = new UserReferral({
        email: email,
        referralCode: refCode,
        longUrl: `https://uat.blockdegree.org/login?refId=${refCode}`,
        registrations: [],
      });
      await newCode.save();
      return true;
    } catch (e) {
      console.log(`exception at ${__filename}.createUserReferral : `, e);
      return false;
    }
  });
}

async function createReferralAllUser() {
  setImmediate(async () => {
    const allUsers = await User.find({}, "email").lean();
    for (let i = 0; i < allUsers.length; i++) {
      if (
        allUsers[i].email === undefined ||
        allUsers[i].email === null ||
        allUsers[i].email === ""
      )
        continue;
      createUserReferral(allUsers[i].email);
    }
  });
}

em.on("referralUsage", referralUsage);
em.on("createUserReferral", createUserReferral);
em.on("createReferralAllUser", createReferralAllUser);

exports.em = em;

exports.refIdExists = async (id) => {
  try {
    const refId = await UserReferral.findOne({ referralCode: id });
    if (refId === null) {
      return false;
    }
    return true;
  } catch (e) {
    console.log(`exception at ${__filename}.refIdExists: `, e);
    return false;
  }
};
