var EventEmitter = require("events").EventEmitter;
const Visited = require("../models/visited");

var eventEmitter = new EventEmitter();

const newVisited = (email, course) => {
  return new Visited({
    email: email,
    course: course,
    count: 1
  });
};

var visitedCourseHandler = async (user_email, course) => {
  console.log(`Inside the visited course handler ${user_email} ${course}`);
  const existingStat = await Visited.findOne({
    email: user_email,
    course: course
  }).catch(err => console.error(`Error while querying the DB ${err}`));
  if (existingStat) {
    // not first time user, simple update the count
    existingStat.count += 1;
    existingStat.save();
    return;
  } else {
    // New user, create new stat & set count to 1
    var newStat = newVisited(user_email, course);
    newStat.save();
    return;
  }
};

eventEmitter.on("visited", visitedCourseHandler);

exports.em = eventEmitter;
