const profileService = require("../services/userProfile");
const requireLogin = require("../middleware/requireLogin");
const requireProfileSet = require("../middleware/requireProfileSet");

module.exports = app => {
  app.get("/api/setupProfile", requireLogin, profileService.setupProfile);
  app.get(
    "/api/getProfile",
    requireLogin,
    requireProfileSet,
    profileService.getProfile
  );
  app.get(
    "/api/addEdu",
    requireLogin,
    requireProfileSet,
    profileService.addProfileEdu
  );
  app.post("/api/setName", requireLogin, profileService.setProfileName);
  app.post("/api/updateSocial", requireLogin, profileService.updateSocial);
  app.post("/api/removeSocial", requireLogin, profileService.removeSocial);
};
