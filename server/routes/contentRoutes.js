var requireLogin = require("../middleware/requireLogin");
const videoSub = require("../middleware/videoSub");
var courseService = require("../services/content");
const userStats = require("../services/userStats");
const streaming = require("../services/videoStreaming");

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
  app.get("/api/getCurrentTimestamp", courseService.getCurrentTimestamp);
  app.get("/api/videoStream/:id", requireLogin, videoSub, streaming.videoStreaming);
  app.get("/video-stream", requireLogin, (req, res) => {
    try {
      const videoSub = req.user.videoSubscription;
      res.render("videoStream", { video: videoSub });
    }
    catch (e) {
      console.log(e);
    }
  });
  app.post("/api/qna", requireLogin, userStats.qna);
  app.post("/api/getQna", requireLogin, userStats.getQna);
};
