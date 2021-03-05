var requireLogin = require("../middleware/requireLogin");
const videoSub = require("../middleware/videoSub");
var courseService = require("../services/content");
const userStats = require("../services/userStats");
const streaming = require("../services/videoStreaming");

const Overview = {
  1: "In this lecture, you will learn about a brief overview of Blockchain Technology, some of its use cases, and why it will change the world. ",
  2: "In this lecture, we learn about the 6 features and benefits of blockchain technology that distinguish it from other ledger technologies. ",
  3: "In this lecture, we briefly go through the distributed ledger technology (DLT) and how it is different from blockchain technology",
  4: "In this lecture, we simplify how blockchain works, so that you can easily understand and re-explain it to someone with no prior knowledge in blockchain and cryptocurrency. ",
  5: "In this lecture, we examine the type of crypto assets that are currently available. ",
  6: "In this lecture, we examine the social, political and economic implications of bitcoin. Bitcoin is also more commonly known as one the first use cases of blockchain technology. ",
  7: "In this lecture, we talk about Ethereum and its significance in the blockchain ecosystem. ",
  8: "In this lecture, we examine the different types of crypto assets on the blockchain platform. ",
  9: "In this lecture, we examine the difference between a coin and a token, and also explore the different types of tokens available currently in the blockchain ecosystem.",
};

module.exports = (app) => {
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

  app.get(
    "/api/videoStream/:id",
    requireLogin,
    videoSub,
    streaming.videoStreaming
  );
  app.get("/video-stream", requireLogin, (req, res) => {
    try {
      const videoSub = req.user.videoSubscription;
      res.render("videoStream", {
        video: videoSub,
        Overview: JSON.stringify(Overview),
      });
    } catch (e) {
      console.log(e);
    }
  });
};
