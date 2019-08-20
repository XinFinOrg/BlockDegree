const PromoCode = require("../models/promo_code");

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
    res.status(400), json({ error: "Bad request" });
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
  res.status(200).json({ error: null });
};

// admin functionality
exports.activatePromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    res.status(400), json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      res
        .status(500)
        .json({ error: "Internal error while accessing promo-code" });
    }
  );
  if (currPromoCode == null) {
    res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  if (currPromoCode.status) {
    res.status(200).json({ error: null, msg: "Already activated" });
  }
  currPromoCode.status = true;
  currPromoCode.save();
  res.status(200).json({ error: null, msg: "ok" });
};

// admin functionality
exports.deactivatePromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    res.status(400).json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      res
        .status(500)
        .json({ error: "Internal error while accessing promo-code" });
    }
  );
  if (currPromoCode == null) {
    res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  if (!currPromoCode.status) {
    res.status(200).json({ error: null, msg: "Already deactivated" });
  }
  currPromoCode.status = false;
  currPromoCode.save();
  res.status(200).json({ error: null, msg: "ok" });
};

// user functionality
exports.usePromoCode = async req => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return { error: "bad request" };
  }
  let codeName = req.body.codeName;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      return {
        error: `Error while fetching the promo-code ${codeName} from the DB ${e}`
      };
    }
  );
  if (currPromoCode == null) {
    return { error: `No such promo-code ${codeName}` };
  }
  if (!currPromoCode.status) {
    return { error: `Promo-code ${codeName} no longer valid` };
  }
  console.log(currPromoCode.allowedUsers);
  if (currPromoCode.restricted) {
    for (var i = 0; i < currPromoCode.allowedUsers.length; i++) {
      let user = currPromoCode.allowedUsers[i];
      if (
        user.email != "" &&
        user.email != undefined &&
        user.email == req.user.email
      ) {
        currPromoCode.lastUsed = Date.now();
        currPromoCode.count += 1;
        let discAmt = parseFloat(currPromoCode.discAmt);
        user.count += 1;
        await PromoCode.updateOne(
          { codeName: codeName, "allowedUsers.email": user.email },
          {
            $set: {
              "allowedUsers.$.count": user.count,
              "allowedUsers.$.lastUsed": Date.now()
            }
          }
        );
        console.log("saved");
        return { error: null, msg: "all ok", discAmt: discAmt };
      }
    }
    return { error: `User ${req.user.email} not allowed`, msg: "not ok" };
  }
  currPromoCode.lastUsed = Date.now();
  currPromoCode.count += 1;
  let userArr = currPromoCode.users;
  let discAmt = currPromoCode.discAmt;

  currPromoCode.users = userArr;
  await currPromoCode.save();
  return { error: null, msg: "ok", discAmt: discAmt };
};

exports.restrictPromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return { error: "bad request" };
  }
  let codeName = req.body.codeName;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      return {
        error: `Error while fetching the promo-code ${codeName} from the DB ${e}`
      };
    }
  );
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
  await currPromoCode.save();
  return { error: null, msg: `Promo-code ${codeName} is now restricted !` };
};

exports.unrestrictPromoCode = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return { error: "bad request" };
  }
  let codeName = req.body.codeName;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      return {
        error: `Error while fetching the promo-code ${codeName} from the DB ${e}`
      };
    }
  );
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
  await currPromoCode.save();
  return { error: null, msg: `Promo-code ${codeName} is now un-restricted !` };
};

exports.addAllowedUser = async (req, res) => {
  if (req.body.codeName == undefined || req.body.codeName == "") {
    res.status(400), json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let email = req.body.email;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      res
        .status(500)
        .json({ error: "Internal error while accessing promo-code" });
    }
  );
  if (currPromoCode == null) {
    res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  let user = {
    email: email,
    count: 0,
    created: Date.now(),
    lastUsed: ""
  };
  await PromoCode.updateOne(
    { codeName: codeName },
    { $push: { allowedUsers: user } }
  );
  res.status(200).json({ error: null, msg: "all ok" });
};

exports.checkCode = async (req, res) => {
  console.log("Request Body : ", req.body);
  if (req.body.codeName == undefined || req.body.codeName == "") {
    return res.status(400).json({ error: "Bad request" });
  }
  let codeName = req.body.codeName;
  let currPromoCode = await PromoCode.findOne({ codeName: codeName }).catch(
    e => {
      return res
        .status(500)
        .json({ error: "Internal error while accessing promo-code" });
    }
  );
  if (currPromoCode == null) {
    return res.status(200).json({ error: `no promo-code ${codeName} exists` });
  }
  if (!currPromoCode.status){
    return res.json({error:"code not active"});
  }
  if (currPromoCode.restricted) {
    // check if the user has access
    for (var i = 0; i < currPromoCode.allowedUsers.length; i++) {
      if (currPromoCode.allowedUsers[i].email == req.user.email) {
        console.log("Inside match")
        return res.json({ error: null, discAmt: currPromoCode.discAmt });
      }
    }
    return res.json({ error: "You don't have access to this code." });
  }
  res.json({error:null,discAmt:currPromoCode.discAmt})
};
