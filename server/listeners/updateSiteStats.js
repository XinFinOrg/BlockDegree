const User = require("../models/user");
const Visited = require("../models/visited");
const EventEmitter = require("events").EventEmitter;

const em = new EventEmitter();

em.on("setSiteStats", async () => {
  console.log("called");
  let allUsers = await User.find({});
  let allVisits = await Visited.find({});

  let userCnt = 0,
    visitCnt = 0,
    totCertis = 0;
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
  

  RedisClient.set(
    "siteStats",
    JSON.stringify({
      certificates: totCertis,
      visits: visitCnt,
      registrations: userCnt,
      ca: 50,
    })
  );
});

exports.em = em;
