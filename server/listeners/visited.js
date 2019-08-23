let EventEmitter = require("events").EventEmitter;
const Visited = require("../models/visited");

let eventEmitter = new EventEmitter();

const newVisited = (email, ip, course) => {
  return new Visited({
    email: email,
    ip: ip,
    course: course,
    count: 1,
    firstVisit: "",
    lastVisit: ""
  });
};

let visitedCourseHandler = (req, course) => {
  setImmediate(async () => {
    let user_email = req.user.email;
    console.log(`Inside the visited course handler ${user_email} ${course}`);
    const fromIP = req.headers["x-forwarded-for"] || req.ip;
    const existingStat = await Visited.findOne({
      email: user_email,
      course: course
    }).catch(err => console.error(`Error while querying the DB ${err}`));
    if (existingStat) {
      // not first time user, simple update the count
      existingStat.count += 1;
      existingStat.lastVisit = Date.now();
      await existingStat.save();
    } else {
      // New user, create new stat & set count to 1
      let newStat = newVisited(user_email, fromIP, course);
      newStat.firstVisit = Date.now();
      newStat.lastVisit = Date.now();
      await newStat.save();
    }
  });
};

let visitedCourseCurriculum = (req, courseCurriculum) => {
  setImmediate(async () => {
    console.log("inside visited curriculum");
    const fromIP = req.headers["x-forwarded-for"] || req.ip;
    if (req.user) {
      // is logged in, track by email address
      const existingStat = await Visited.findOne({
        email: req.user.email,
        course: courseCurriculum
      }).catch(err => console.error(`Error while querying the DB ${err}`));
      if (existingStat) {
        // not first time user, simple update the count
        existingStat.count += 1;
        existingStat.lastVisit = Date.now();
        await existingStat.save();
      } else {
        // New user, create new stat & set count to 1
        let newStat = newVisited(req.user.email, fromIP, courseCurriculum);
        newStat.firstVisit = Date.now();
        newStat.lastVisit = Date.now();
        await newStat.save();
      }
    } else {
      // not logged in, track by their IP address
      const existingStat = await Visited.findOne({
        email: "", // cant associate IP address for sure with the user email, e.g.: switch in network.
        ip: fromIP,
        course: courseCurriculum
      }).catch(err => console.error(`Error while querying the DB ${err}`));
      if (existingStat) {
        // stat exists, update the count
        existingStat.count += 1;
        existingStat.lastVisit = Date.now();
        await existingStat.save();
      } else {
        // new stat, create one & set count to 1
        let newStat = newVisited("", fromIP, courseCurriculum);
        newStat.firstVisit = Date.now();
        newStat.lastVisit = Date.now();
        await newStat.save();
      }
    }
  });
};

eventEmitter.on("visited", visitedCourseHandler);
eventEmitter.on("visitedCurriculum", visitedCourseCurriculum);

exports.em = eventEmitter;
