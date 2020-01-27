var requireLogin = require("../middleware/requireLogin");
var courseService = require("../services/content");
const userStats = require("../services/userStats");

module.exports = app => {
  app.get("/courses/:courseName", requireLogin, courseService.renderCourses);
  app.get(
    "/courses/:courseName/:content",
    requireLogin,
    courseService.renderCourseContent
  );
  app.get("/api/callCurriculum", courseService.callCurriculum);
  // app.get("/api/certCount",userStats.currCertificateCount);
  // app.get("/api/userCount",userStats.currUserCount);
  // app.get("/api/visitCount",userStats.currVisitCount);
  // app.get("/api/caCount",userStats.currCACount);

  app.get("/api/getSiteStats", userStats.getSiteStats);
  app.get("/api/getXinFinStats", userStats.getXinFinStats);
  app.get("/api/getCurrentTimestamp",courseService.getCurrentTimestamp);
};
