const PromoCode = require("../models/promo_code");
const PromoCodeLog = require("../models/promocode_log");

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
  console.log(req.body);
  if (!checkReqBody_NewPromo(req.body, "codeName|discAmt|purpose|restricted")) {
    // bad request
    return res.status(400).json({ error: "Bad request" });
  } else {
    try {
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
      return res.status(500).json({ error: "Internal error" });
    }
    res.status(200).json({ error: null });
  }
};

// admin functionality
exports.activatePromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }
  if (currPromoCode == null) {
    return res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  if (currPromoCode.status) {
    return res.status(200).json({ error: null, msg: "Already activated" });
  }
  currPromoCode.status = true;
  try {
    currPromoCode.save();
  } catch (e) {
    res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }
  res.status(200).json({ error: null, msg: "ok" });
};

// admin functionality
exports.deactivatePromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }
  if (currPromoCode == null) {
    return res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  if (!currPromoCode.status) {
    return res.status(200).json({ error: null, msg: "Already deactivated" });
  }
  currPromoCode.status = false;
  try {
    currPromoCode.save();
  } catch (e) {
    res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }
  res.status(200).json({ error: null, msg: "ok" });
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
    course_id: req.body.course_id || req.body.course ,
    course_price: req.body.price,
    used_date: Date.now()
  });

  // currPromoCode.users = userArr;
  try {
    await currPromoCode.save();
    await newPromoLog.save();
  } catch (e) {    
    console.log("Error: ",e)
    return { error: "Error while saving the promocode query" };
  }

  return { error: null, msg: "ok", discAmt: discAmt };
};

exports.restrictPromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return { error: "bad request" };
  }
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
  if (currPromoCode.restricted) {
    // already restricted, no need to save.
    return {
      error: null,
      msg: `Promo-code ${codeName} is already restricted :)`
    };
  }
  currPromoCode.restricted = true;
  try {
    await currPromoCode.save();
  } catch (e) {
    return { error: "Some error occured while saving the promo-code" };
  }
  return { error: null, msg: `Promo-code ${codeName} is now restricted !` };
};

exports.unrestrictPromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return { error: "bad request" };
  }
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
  if (!currPromoCode.restricted) {
    // already restricted, no need to save.
    return {
      error: null,
      msg: `Promo-code ${codeName} is already un-restricted :)`
    };
  }
  currPromoCode.restricted = false;
  try {
    await currPromoCode.save();
  } catch (e) {
    return { error: "Some error occured while saving the promocode" };
  }
  return { error: null, msg: `Promo-code ${codeName} is now un-restricted !` };
};

exports.addAllowedUser = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400), json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let email = req.body.email;
  let currPromoCode;
  try {
    currPromoCode = await PromoCode.findOne({ codeName: codeName });
  } catch (e) {
    res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }
  if (currPromoCode == null) {
    return res.status(200).json({ error: `no promo-code ${codeName} exists` });
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
    res
      .status(500)
      .json({ error: "Internal error while accessing promo-code" });
  }

  res.status(200).json({ error: null, msg: "all ok" });
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
