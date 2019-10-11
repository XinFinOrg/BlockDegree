let EventEmitter = require("events").EventEmitter;
const Visited = require("../models/visited");
const GeoIP = require("geoip-lite");

let eventEmitter = new EventEmitter();

const newVisited = (email, ip, course) => {
  return new Visited({
    email: email,
    ip: ip,
    course: course,
    count: 1,
    firstVisit: "",
    lastVisit: "",
    region: "",
    city: "",
    country: "",
    coordinates: []
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
      try {
        await existingStat.save();
      } catch (e) {
        console.error(`Error while saving to DB at listeners.visited ${e}`);
        return;
      }
    } else {
      // New user, create new stat & set count to 1
      let geo = GeoIP.lookup(fromIP);
      let newStat = newVisited(user_email, fromIP, course);
      newStat.firstVisit = Date.now();
      newStat.lastVisit = Date.now();
      newStat.region = geo.region;
      newStat.city = geo.city;
      newStat.coordinates = [geo.ll[0].toString(), geo.ll[1].toString()];
      newStat.country = geo.country;
      try {
        await newStat.save();
      } catch (e) {
        console.error(`Error while saving to DB at listeners.visited ${e}`);
        return;
      }
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
        try {
          await existingStat.save();
        } catch (e) {
          console.log(`Error while saving to DB at listeners.visited ${e}`);
        }
      } else {
        // New user, create new stat & set count to 1
        let newStat = newVisited(req.user.email, fromIP, courseCurriculum);
        newStat.firstVisit = Date.now();
        newStat.lastVisit = Date.now();
        try {
          await newStat.save();
        } catch (e) {
          console.error(`Error while saving to DB at listeners.visited ${e}`);
          return;
        }
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
        try {
          await existingStat.save();
        } catch (e) {
          console.log(`Error while saving to DB at listeners.visited ${e}`);
        }
      } else {
        // new stat, create one & set count to 1
        let newStat = newVisited("", fromIP, courseCurriculum);
        newStat.firstVisit = Date.now();
        newStat.lastVisit = Date.now();
        try {
          await newStat.save();
        } catch (e) {
          console.error(`Error while saving to DB at listeners.visited ${e}`);
          return;
        }
      }
    }
  });
};

eventEmitter.on("visited", visitedCourseHandler);
eventEmitter.on("visitedCurriculum", visitedCourseCurriculum);

exports.em = eventEmitter;
