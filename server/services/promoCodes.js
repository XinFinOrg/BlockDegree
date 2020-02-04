const PromoCode = require("../models/promo_code");
const PromoCodeLog = require("../models/promocode_log");
const ReferralCode = require("../models/referral_code");

function checkReqBody_NewPromo(obj, list) {
  if (typeof list === "string") {
    list = list.split("|");
  }
  for (prop of list) {
    let val = obj[prop];
    if (val == undefined || val == "") {
      return false;
    }
  }
  return true;
}

// admin functionality
exports.addPromoCode = async (req, res) => {
  console.log("called add promo-code");
  if (!checkReqBody_NewPromo(req.body, "codeName|discAmt|purpose|restricted")) {
    // bad request
    return res.status(400).json({ status: false, error: "Bad request" });
  } else {
    try {
      const codeExists = await PromoCode.findOne({
        codeName: req.body.codeName
      });
      if (codeExists !== null) {
        return res
          .status(400)
          .json({ status: false, error: "code with that name already exists" });
      }
      let newPromoCode = new PromoCode({
        codeName: req.body.codeName,
        discAmt: req.body.discAmt,
        purpose: req.body.purpose,
        status: false,
        count: 0,
        created: "" + Date.now(),
        lastUsed: "",
        users: [{}],
        restricted: req.body.restricted == "true",
        allowedUsers: [{}]
      });
      await newPromoCode.save();
    } catch (e) {
      console.log(`Exception while creating new promocode: `, e);
      return res.status(500).json({ status: false, error: "Internal error" });
    }
    res.status(200).json({ status: true, error: null });
  }
};

// admin functionality
exports.activatePromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ status: false, error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    res.status(500).json({
      status: false,
      error: "Internal error while accessing promo-code"
    });
  }
  if (currPromoCode == null) {
    return res
      .status(200)
      .json({ status: false, error: `no promo-code ${codeName} exists` });
  }
  if (currPromoCode.status) {
    return res.status(200).json({ status: false, error: "Already activated" });
  }
  currPromoCode.status = true;
  try {
    currPromoCode.save();
  } catch (e) {
    res.status(500).json({
      status: false,
      error: "Internal error while accessing promo-code"
    });
  }
  res.status(200).json({ status: true, error: null, msg: "ok" });
};

// admin functionality
exports.deactivatePromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ status: false, error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    return res.status(500).json({
      status: false,
      error: "Internal error while accessing promo-code"
    });
  }
  if (currPromoCode == null) {
    return res
      .status(200)
      .json({ status: false, error: `no promo-code ${codeName} exists` });
  }
  if (!currPromoCode.status) {
    return res
      .status(200)
      .json({ status: false, error: "Already deactivated" });
  }
  currPromoCode.status = false;
  try {
    currPromoCode.save();
  } catch (e) {
    res.status(500).json({
      status: false,
      error: "Internal error while accessing promo-code"
    });
  }
  return res.status(200).json({ status: true, error: null, msg: "ok" });
};

// user functionality
exports.usePromoCode = async req => {
  if (
    req.body.codeName == undefined ||
    req.body.codeName == null ||
    req.body.codeName == ""
  ) {
    return { error: "bad request" };
  }
  let userEmail = req.user.email;
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    return {
      error: `Error while fetching the promo-code ${codeName} from the DB ${e}`
    };
  }
  if (currPromoCode == null) {
    return { error: `No such promo-code ${codeName}` };
  }
  if (!currPromoCode.status) {
    return { error: `Promo-code ${codeName} no longer valid` };
  }
  if (
    currPromoCode.hasCap !== undefined &&
    currPromoCode.hasCap &&
    currPromoCode.count >= currPromoCode.useLimit
  ) {
    // over the limit, disable the code
    try {
      currPromoCode.status = false;
      await currPromoCode.save();
      return { error: `Promocode limit reached` };
    } catch (e) {
      console.error("Some error occured while saving the promocode state ", e);
      return { error: "internal error" };
    }
  }
  if (currPromoCode.restricted) {
    for (var i = 0; i < currPromoCode.allowedUsers.length; i++) {
      let user = currPromoCode.allowedUsers[i];
      if (
        user.email != "" &&
        user.email != undefined &&
        user.email == userEmail
      ) {
        currPromoCode.lastUsed = Date.now();
        currPromoCode.count += 1;
        let discAmt = parseFloat(currPromoCode.discAmt);
        user.count += 1;
        try {
          await PromoCode.updateOne(
            { codeName: codeName, "allowedUsers.email": user.email },
            {
              $set: {
                "allowedUsers.$.count": user.count,
                "allowedUsers.$.lastUsed": Date.now()
              }
            }
          );
        } catch (e) {
          return {
            error: `Error while updating the promo-code ${codeName} from the DB ${e}`
          };
        }
        console.log("saved");
        return { error: null, msg: "all ok", discAmt: discAmt };
      }
    }
    return { error: `User ${userEmail} not allowed`, msg: "not ok" };
  }
  currPromoCode.lastUsed = Date.now();
  currPromoCode.count += 1;
  let userArr = currPromoCode.users;
  let discAmt = currPromoCode.discAmt;
  let userExists = false;
  let userIndex = 0;
  for (let i = 0; i < userArr.length; i++) {
    const currObjEmail = userArr[i];
    if (currObjEmail.email == userEmail) {
      userExists = true;
      userIndex = i;
    }
  }
  if (!userExists) {
    let newUserObj = {};
    newUserObj = {
      email: userEmail,
      count: 1,
      firstUsed: Date.now(),
      lastUsed: Date.now()
    };
    currPromoCode.users.push(newUserObj);
  } else {
    // update used count & last used date
    let newCount = userArr[userIndex].count + 1;
    try {
      await PromoCode.updateOne(
        { codeName: codeName, "users.email": userEmail },
        {
          $set: {
            "users.$.count": newCount,
            "users.$.lastUsed": Date.now()
          }
        }
      );
    } catch (e) {
      return {
        error: `Error while updating the promo-code ${codeName} from the DB ${e}`
      };
    }
  }
  let newPromoLog = new PromoCodeLog({
    codeName: codeName,
    discAmt: discAmt,
    user_email: userEmail,
    course_id: req.body.course_id || req.body.course,
    course_price: req.body.price,
    used_date: Date.now()
  });

  // currPromoCode.users = userArr;
  try {
    await currPromoCode.save();
    await newPromoLog.save();
  } catch (e) {
    console.log("Error: ", e);
    return { error: "Error while saving the promocode query" };
  }

  return { error: null, msg: "ok", discAmt: discAmt };
};

exports.restrictPromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.json({ status: false, error: "bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    return res.json({
      status: false,
      error: `Error while fetching the promo-code ${codeName} from the DB ${e}`
    });
  }
  if (currPromoCode == null) {
    return res.json({ status: false, error: `No such promo-code ${codeName}` });
  }
  if (currPromoCode.restricted) {
    // already restricted, no need to save.
    return res.json({
      status: false,
      error: `Promo-code ${codeName} is already restricted :)`
    });
  }
  currPromoCode.restricted = true;
  try {
    await currPromoCode.save();
  } catch (e) {
    return res.json({
      status: false,
      error: "Some error occured while saving the promo-code"
    });
  }
  return res.json({
    status: true,
    error: null,
    msg: `Promo-code ${codeName} is now restricted !`
  });
};

exports.unrestrictPromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.json({ status: false, error: "bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    return res.json({
      status: false,
      error: `Error while fetching the promo-code ${codeName} from the DB ${e}`
    });
  }
  if (currPromoCode == null) {
    return res.json({ status: false, error: `No such promo-code ${codeName}` });
  }
  if (!currPromoCode.restricted) {
    // already restricted, no need to save.
    return res.json({
      error: `Promo-code ${codeName} is already un-restricted :)`,
      status: false
    });
  }
  currPromoCode.restricted = false;
  try {
    await currPromoCode.save();
  } catch (e) {
    return res.json({
      status: false,
      error: "Some error occured while saving the promocode"
    });
  }
  return res.json({
    status: true,
    error: `Promo-code ${codeName} is now un-restricted !`
  });
};

exports.addAllowedUser = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ status: false, error: "Bad request" });
  }
  if (req.body.email == undefined || req.body.email == "") {
    return res.status(400).json({ status: false, error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let email = req.body.email;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    res.status(500).json({
      status: false,
      error: "Internal error while accessing promo-code"
    });
  }
  if (currPromoCode == null) {
    return res
      .status(200)
      .json({ status: false, error: `no promo-code ${codeName} exists` });
  }

  for (let i = 0; i < currPromoCode.allowedUsers.length; i++) {
    console.log(currPromoCode.allowedUsers[i]["email"]);
    console.log(currPromoCode.allowedUsers[i]["email"] === email);
    if (
      currPromoCode.allowedUsers[i]["email"] != undefined &&
      currPromoCode.allowedUsers[i]["email"] === email
    ) {
      return res
        .status(200)
        .json({ status: false, error: `user already allowed` });
    }
  }

  let user = {
    email: email,
    count: 0,
    created: Date.now(),
    lastUsed: ""
  };
  try {
    await PromoCode.updateOne(
      { codeName: codeName },
      { $push: { allowedUsers: user } }
    );
  } catch (e) {
    console.error(
      `Exception at addAllowedUser for user ${req.user.email} : `,
      e
    );
    res.status(500).json({
      status: false,
      error: "Internal error while accessing promo-code"
    });
  }
  res.status(200).json({ status: true, error: null, msg: "all ok" });
};

exports.checkCode = async (req, res) => {
  console.log("Request Body : ", req.body);
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    console.error(`Exception at checkCode for user ${req.user.email} : `, e);
    return res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }
  if (currPromoCode == null) {
    return res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  if (!currPromoCode.status) {
    return res.json({ error: "code not active" });
  }
  if (
    currPromoCode.hasCap !== undefined &&
    currPromoCode.hasCap &&
    currPromoCode.count >= currPromoCode.useLimit
  ) {
    // over the limit, disable the code
    try {
      currPromoCode.status = false;
      await currPromoCode.save();
      return res.json({ error: "promocode limit reached" });
    } catch (e) {
      console.error("Some error occured while saving the promocode state ", e);
      return res.json({ error: "internal error" });
    }
  }
  if (currPromoCode.restricted) {
    // check if the user has access
    for (var i = 0; i < currPromoCode.allowedUsers.length; i++) {
      if (currPromoCode.allowedUsers[i].email == req.user.email) {
        console.log("Inside match");
        return res.json({ error: null, discAmt: currPromoCode.discAmt });
      }
    }
    return res.json({ error: "You don't have access to this code." });
  }
  res.json({ error: null, discAmt: currPromoCode.discAmt });
};

exports.setPromoCodeCap = async (req, res) => {
  if (
    req.body.codeName === undefined ||
    req.body.codeName === null ||
    req.body.codeName === "" ||
    req.body.setCap === undefined ||
    req.body.setCap === null ||
    req.body.setCap === ""
  ) {
    // bad request
    return res.json({ error: "bad request", status: false });
  }
  const codeName = req.body.codeName;
  const setCap = req.body.setCap === "true";
  try {
    const promoCode = await PromoCode.findOne({ codeName: codeName });
    if (promoCode === null) {
      return res.json({ error: "No such promocode exists", status: false });
    }
    if (promoCode.hasCap !== undefined) {
      // this schema has 'hasCap' element
      promoCode.hasCap = setCap;
    } else {
      console.log("does not have hasCap");
      promoCode.set("hasCap", setCap);
    }
    await promoCode.save();
    return res.json({ status: true, error: null });
  } catch (e) {
    console.error("Some error occured while fetching the promo-code ", e);
    return res.json({ error: "internal error", status: false });
  }
};

exports.setPromoCodeUseLimit = async (req, res) => {
  if (
    req.body.codeName === undefined ||
    req.body.codeName === null ||
    req.body.codeName === "" ||
    req.body.useLimit === undefined ||
    req.body.useLimit === null ||
    req.body.useLimit === ""
  ) {
    // bad request
    return res.json({ error: "bad request", status: false });
  }
  const codeName = req.body.codeName;
  const useLimit = req.body.useLimit;

  try {
    const promoCode = await PromoCode.findOne({ codeName: codeName });
    if (promoCode === null) {
      return res.json({ error: "no such promo-code exists", status: false });
    }
    if (promoCode.hasCap !== undefined) {
      if (promoCode.useLimit === undefined) {
        promoCode.set("useLimit", parseInt(useLimit));
      } else {
        promoCode.useLimit = useLimit;
      }
    } else {
      return res.json({ error: "cap has not been initialized", status: false });
    }
    await promoCode.save();
    return res.json({ error: null, status: true });
  } catch (e) {
    console.log("Some error occured at promoCodes.setUseLimit: ", e);
    return res.json({ error: "internal error", status: false });
  }
};

exports.useReferralCode = async req => {
  console.log("called useReferralCode");
  const userEmail = req.user.email;
  const referralCode = req.body.referralCode;
  const course = req.body.course_id;
  console.log(userEmail, referralCode, course);
  if (referralCode == undefined || referralCode == null || referralCode == "") {
    return { error: "bad request" };
  }
  try {
    const refCode = await ReferralCode.findOne({ referralCode: referralCode });
    if (refCode == null) {
      return { error: "no such referral code exists!" };
    }
    if (!refCode.status) {
      return { error: "referral code no longer valid!" };
    }
    refCode.count++;
    let userExists = false;
    for (let i = 0; i < refCode.users.length; i++) {
      console.log(refCode.users[i]);
      if (refCode.users[i].email == userEmail) {
        userExists = true;
        if (!(`${course}_count` in refCode.users[i])) {
          // does not exist
          refCode.users[i][`${course}_count`] = 1;
        } else {
          refCode.users[i][`${course}_count`]++;
        }
        let currTimeStamp = Date.now();
        refCode.users[i].count++;
        refCode.users[i].lastUsed = currTimeStamp;
        refCode.lastUsed = currTimeStamp;
      }
    }
    if (!userExists) {
      let currTimeStamp = Date.now();
      let newObj = {
        email: userEmail,
        created: currTimeStamp,
        lastUsed: currTimeStamp,
        count: 1
      };
      newObj[`${course}_count`] = 1;
      refCode.users.push(newObj);
    }
    refCode.markModified("users");
    await refCode.save();
    return { error: null };
  } catch (e) {
    console.error("Some exception occured at promoCodes.useReferralCodes: ", e);
    return { error: "internal error" };
  }
};

exports.checkReferralCode = async (req, res) => {
  const referralCode = req.body.referralCode;
  if (referralCode == undefined || referralCode == null || referralCode == "") {
    return res.json({ status: false, error: "bad request" });
  }
  try {
    const refCode = await ReferralCode.findOne({ referralCode: referralCode });
    if (refCode == null) {
      return res.json({
        status: false,
        error: "no such referral code exists!"
      });
    }
    if (!refCode.status) {
      return res.json({
        status: false,
        error: "referral code no longer valid!"
      });
    }
  } catch (e) {
    console.error("Some error occured at promoCodes.checkReferralCode: ", e);
    return res.json({ status: false, error: "internal error" });
  }
  return res.json({ error: null, status: true });
};
