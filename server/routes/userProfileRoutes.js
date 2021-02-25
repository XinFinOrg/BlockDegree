const profileService = require("../services/userProfile");
const requireLogin = require("../middleware/requireLogin");
const requireProfileSet = require("../middleware/requireProfileSet");
const fileUpload = require("../middleware/fileUpload");

module.exports = (app) => {
  app.get("/api/setupProfile", requireLogin, profileService.setupProfile);
  app.post("/api/kycUserDetails", requireLogin, profileService.kycUserDetails);
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
  app.get(
    "/api/getUserCryptoPayment",
    requireLogin,
    profileService.getUserCryptoPayment
  );
  app.post("/api/getCourseMeta", requireLogin, profileService.getCourseMeta);
  app.get(
    "/api/getUserPaypalPayment",
    requireLogin,
    profileService.getUserPaypalPayment
  );
  app.get("/api/getUserRefId", requireLogin, profileService.getUserRefId);
};
