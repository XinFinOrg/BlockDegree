const User = require("../models/user");
const PromoCode = require("../models/promo_code");
const Visited = require("../models/visited");
const PaymentLogs = require("../models/payment_logs");
const GeoIP = require("geoip-lite");

exports.getAllUserTimestamp = async (req, res) => {
  const users = await User.find({});
  console.log(users);
  let retTimestamp = {};
  users.forEach(user => {
    const email = getEmail(user);
    retTimestamp[email] = user._id.getTimestamp();
    console.log(user._id.getTimestamp());
    console.log(Date.parse(user._id.getTimestamp()));
  });
  res.status(200).json(retTimestamp);
};

exports.getUsersLastNDays = async (req, res) => {
  const users = await User.find({});
  let count = 0;
  let today = new Date();
  const timeWindow = req.body.days * (1000 * 3600 * 24);
  today.setHours(0, 0, 0, 0);
  let retTimestamp = [];
  users.forEach(async user => {
    const email = getEmail(user);
    const userDate = user._id.getTimestamp();
    if (userDate.getTime() > today.getTime()) {
      // registered today, gets a pass
      retTimestamp.push({ email: email, time: userDate });
      count++;
      return;
    }
    const timeDiff = Math.abs(today.getTime() - userDate);
    if (timeDiff < timeWindow) {
      retTimestamp.push({ email: email, time: userDate });
      count++;
    }
  });
  res.status(200).json(retTimestamp);
};

exports.getUserLastQuater = async (req, res) => {
  let retUsers = [];
  const users = await User.find({});
  let today = new Date();
  let currMonth = today.getMonth();
  users.forEach(user => {
    const email = getEmail(user);
    const userDate = user._id.getTimestamp();
    if (currMonth - new Date(userDate).getMonth() <= 3) {
      retUsers.push({ email: email, time: userDate });
    }
  });
  console.log(retUsers);
  res.status(200).json(retUsers);
};

function getEmail(user) {
  return user.email;
}

exports.getByLastActiveDay = async (req, res) => {
  const users = await User.find({});
  let today = new Date();
  const timeWindow = req.body.days * (1000 * 3600 * 24);
  today.setHours(0, 0, 0, 0);
  let retTimestamp = [];
  users.forEach(async user => {
    const email = getEmail(user);
    if (user.lastActive != "") {
      const userDate = parseFloat(user.lastActive);
      if (userDate > today.getTime()) {
        // registered today, gets a pass
        console.log(user);
        retTimestamp.push({ email: email, time: userDate });
        return;
      }
      const timeDiff = Math.abs(today.getTime() - userDate);
      if (timeDiff < timeWindow) {
        retTimestamp.push({ email: email, time: userDate });
      }
    }
  });
  //   console.log(retTimestamp)
  res.status(200).json(retTimestamp);
};

exports.getUserListUsingCode = async (req, res) => {
  if (req.body.codeName != "") {
    let promoCode = await PromoCode.findOne({ codeName: req.body.codeName });
    if (promoCode == null) {
      res.json({
        error: `No promocode ${promoCode} found`,
        users: null,
        status: false
      });
    }
    if (!promoCode.restricted) {
      // retrieve from users
      res.json({
        error: null,
        users: promoCode.users,
        status: true,
        restricted: false
      });
    } else {
      // retrieve from allowed user
      res.json({
        error: null,
        users: promoCode.allowedUsers,
        status: true,
        restricted: true
      });
    }
  } else {
    res.json({
      error: "Bad request",
      status: false,
      users: null,
      restricted: null
    });
  }
};
exports.getAllCodes = async (req, res) => {
  let allCodes = await PromoCode.find({});
  res.json({ codes: allCodes });
};

exports.getVisits = async (req, res) => {
  let allVisits = await Visited.find({ course: req.body.content });
  if (allVisits == null) {
    res.json({
      status: false,
      error: `No Such content (${req.body.content}) is registered`
    });
  } else {
    res.json({ status: true, error: null, visits: allVisits });
  }
};
// exports.getRestrictedCodes = async () => {};
// exports.getUnrestrictedCodes = async () => {};
// exports.getActiveCodes = async () => {};
// exports.getInActiveCodes = async () => {};

exports.getAllUserPaymentList = async (req, res) => {
  let payPalSucList = {};
  let codeUsageCount = {};
  let allPaypalPayment = await PaymentLogs.find({ payment_status: true });
  let allCodeUsage = await PromoCode.find({});
  for (let i = 0; i < allPaypalPayment.length; i++) {
    let currentLog = allPaypalPayment[i];
    if (
      payPalSucList[currentLog.email] == "" ||
      payPalSucList[currentLog.email] == null ||
      payPalSucList[currentLog.email] == undefined
    ) {
      // first encounter; create new object
      let newObj = {};
      newObj[currentLog.course_id] = 1;
      payPalSucList[currentLog.email] = newObj;
    } else {
      // user object exists
      payPalSucList[currentLog.email][currentLog.course_id] =
        payPalSucList[currentLog.email][currentLog.course_id] == null
          ? 1
          : payPalSucList[currentLog.email][currentLog.course_id] + 1;
    }
  }
  // console.log(payPalSucList);
  for (let i = 0; i < allCodeUsage.length; i++) {
    let currentCode = allCodeUsage[i];
    for (let j = 1; j < currentCode.users.length; j++) {
      let currentUser = currentCode.users[j];
      if (
        codeUsageCount[currentUser.email] == undefined ||
        codeUsageCount[currentUser.email] == ""
      ) {
        // first encounter; create new object
        let newObj = {};
        newObj[currentCode.codeName] = currentUser.count;
        codeUsageCount[currentUser.email] = newObj;
      } else {
        codeUsageCount[currentUser.email][currentCode.codeName] =
          currentUser.count;
      }
    }
    for (let j = 1; j < currentCode.allowedUsers.length; j++) {
      let currentUser = currentCode.allowedUsers[j];
      if (
        codeUsageCount[currentUser.email] == undefined ||
        codeUsageCount[currentUser.email] == ""
      ) {
        // first encounter; create new object
        let newObj = {};
        newObj[currentCode.codeName] = currentUser.count;
        codeUsageCount[currentUser.email] = newObj;
      } else {
        codeUsageCount[currentUser.email][currentCode.codeName] =
          currentUser.count;
      }
    }
  }
  // console.log(codeUsageCount);
  let overAllList = [];
  let payPalSucList_keys = Object.keys(payPalSucList);
  let codeUsageCount_keys = Object.keys(codeUsageCount);
  for (let i = 0; i < payPalSucList_keys.length; i++) {
    let currentEmail = payPalSucList_keys[i];
    let newObj = {
      email: currentEmail,
      payment: payPalSucList[currentEmail]
    };
    overAllList.push(newObj);
  }
  for (let i = 0; i < codeUsageCount_keys.length; i++) {
    let currentEmail = codeUsageCount_keys[i];
    let currentIndex = -1;
    loop1: for (let j = 0; j < overAllList.length; j++) {
      if (overAllList[j].email == currentEmail) {
        currentIndex = j;
        break loop1;
      }
    }
    if (currentIndex >= 0) {
      // exists, just update codes
      overAllList[currentIndex].codes = codeUsageCount[currentEmail];
    } else {
      // user didn't pay via paypal, create newObj
      let newObj = {};
      newObj.email = currentEmail;
      newObj.codes = codeUsageCount[currentEmail];
      overAllList.push(newObj);
    }
  }
  // console.log(overAllList);
  res.json({ status: true, data: overAllList });
};

exports.getAllUserCertificates = async (req, res) => {
  const allUsers = await User.find({
    "examData.certificateHash.1": { $exists: true }
  }).catch(e => res.json({ status: false, users: null, error: e }));
  if (allUsers == null) {
    res.json({ status: false, users: null, error: "No users found" });
  }
  res.json({ status: true, users: allUsers });
};

exports.setCoordsFromIP = async (req, res) => {
  let visits;
  try {
    visits = await Visited.find({});
  } catch (e) {
    console.log("Some error occured: ", e);
    return res.json({
      error: "something went wrong while fetching all the visits",
      status: false
    });
  }
  for (let i = 0; i < visits.length; i++) {
    if (visits[i].ip !== undefined) {
      // IP exists
      let geo = GeoIP.lookup(visits[i].ip);
      if (geo) {
        // ok
        visits[i].region = geo.region;
        visits[i].city = geo.city;
        visits[i].country = geo.country;
        visits[i].coordinates = [geo.ll[0].toString(), geo.ll[1].toString()];
        try {
          await visits[i].save();
        } catch (e) {
          console.log(
            "Some error occured while saving the updated visits: ",
            e
          );
          return res.json({
            status: false,
            error: "error occired while saving the updated schema"
          });
        }
      }
    }
  }
  return res.json({ status: true, error: null });
};

exports.currUserCount = async (req, res) => {
  let allUsers = await User.find({});
  if (allUsers == null) {
    return res.json({ status: false, error: "no users found", count: null });
  } else {
    return res.json({ status: true, error: null, count: allUsers.length });
  }
};

exports.currVisitCount = async (req, res) => {
  let allVisits = await Visited.find({});
  if (allVisits == null) {
    res.json({
      status: false,
      error: `no visits found`
    });
  } else {
    res.json({ status: true, error: null, count: allVisits.length });
  }
};

exports.currCertificateCount = async (req, res) => {
  let totCertis = 0;
  const allUsers = await User.find({
    "examData.certificateHash.1": { $exists: true }
  }).catch(e => res.json({ status: false, users: null, error: e }));
  if (allUsers == null) {
    res.json({ status: false, count: null, error: "No users found" });
  }

  for (let y = 0; y < allUsers.length; y++) {
    if (allUsers[y].examData.certificateHash) {
      totCertis += allUsers[y].examData.certificateHash.length - 1;
    }
  }
  return res.json({ status: true, error: null, count: totCertis });
};

exports.currCACount = async (req,res) => {
  return res.json({status:true, error: null, count:20});
}
