var shareServices = require("../services/shareSocials");
const requireLogin = require("../middleware/requireLogin");

module.exports = app => {
  app.post("/api/shareOnTwitter", requireLogin, shareServices.postTwitter);
  app.post(
    "/api/shareOnLinkedin",
    requireLogin,
    shareServices.uploadImageLinkedin
  );
  app.post("/api/shareOnFacebook", requireLogin, shareServices.postFacebook);
  // Not working : issue in uploading image to uploadURL; tried cURL, HTTPie, axios
  // app.get("/api/uploadImageLinkedin",shareServices.uploadImageLinkedin);
};
