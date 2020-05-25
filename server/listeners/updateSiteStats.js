const EventEmitter = require("events").EventEmitter;

const User = require("../models/user");
const Visited = require("../models/visited");
const UserFundReq = require("../models/userFundRequest");

const { usdToXdc } = require("../helpers/cmcHelper");

const em = new EventEmitter();

em.on("setSiteStats", async () => {
  console.log("called setSiteStats");
  let allUsers = await User.find({});
  let allVisits = await Visited.find({});
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

  let userCnt = 0,
    visitCnt = 0,
    totCertis = 0,
    fmdReqAmnt = 0,
    fmdReqCnt = 0,
    fmdFundedAmnt = 0,
    fmdFundedCnt = 0;
  if (allUsers != null) {
    userCnt = allUsers.length;
  }

  if (allVisits != null) {
    visitCnt = allVisits.length;
  }

  for (let y = 0; y < allUsers.length; y++) {
    if (allUsers[y].examData.certificateHash.length > 1) {
      totCertis += allUsers[y].examData.certificateHash.length - 1;
    }
  }

  for (let i = 0; i < allFunds.length; i++) {
    if (allFunds[i].status === "completed") {
      fmdFundedCnt++;
      fmdFundedAmnt += parseFloat(allFunds[i].amountGoal);
    } else if (allFunds[i].status === "uninitiated") {
      fmdReqCnt++;
      fmdReqAmnt += parseFloat(allFunds[i].amountGoal);
    }
  }

  const fmdFundedAmntXdc = await usdToXdc(fmdFundedAmnt);
  const fmdReqAmntXdc = await usdToXdc(fmdReqAmnt);

  RedisClient.set(
    "siteStats",
    JSON.stringify({
      certificates: totCertis,
      visits: visitCnt,
      registrations: userCnt,
      ca: 50,
      fmdFundedCnt,
      fmdFundedAmnt,
      fmdFundedAmntXdc,
      fmdReqCnt,
      fmdReqAmnt,
      fmdReqAmntXdc,
    })
  );
});

exports.em = em;
