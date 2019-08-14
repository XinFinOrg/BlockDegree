const profileService = require("../services/userProfile");
const requireLogin = require("../middleware/requireLogin");
const requireProfileSet = require("../middleware/requireProfileSet");

module.exports = app => {
  app.get("/api/setupProfile", requireLogin, profileService.setupProfile);
  app.get("/api/getProfile", requireLogin, requireProfileSet, profileService.getProfile);
  app.get("/api/addEdu",requireLogin, requireProfileSet, profileService.addProfileEdu);
};
