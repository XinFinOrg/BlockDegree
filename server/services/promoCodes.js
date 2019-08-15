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
    restricted: req.body.restricted=="restricted",
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
  if (currPromoCode.restricted) {
    currPromoCode.allowedUsers.every(async (user, i) => {
      if (user.email == req.user.email) {
        currPromoCode.lastUsed = Date.now();
        currPromoCode.count += 1;
        let discAmt = parseFloat(currPromoCode.discAmt);
        console.log(currPromoCode.discAmt)
        console.log(discAmt)
        user.count += 1;
        currPromoCode.allowedUsers[i] = user;
        currPromoCode.save();
        return { error: null, msg: "all ok", discAmt: discAmt };
      }
    });
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

exports.addAllowedUser = async (req,res) => {
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
    created: Date.now()
  };
  await PromoCode.updateOne(
    { codeName: codeName },
    { $push: { allowedUser: user } }
  );
  res.status(200).json({ error: null, msg: "all ok" });
};
