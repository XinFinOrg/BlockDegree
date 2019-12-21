const requireLogin = require("../middleware/requireLogin");
const requrieAdmin = require("../middleware/requireAdmin");
const path = require("path");
const adminPath = path.join(__dirname, "../admin/");
const migrationService = require("../services/migrate");
const userStatsService = require("../services/userStats");
const adminServices = require("../services/adminServices");
const cacheSync = require("../services/cacheSync");
const User = require("../models/user");

module.exports = app => {
  app.get("/admin", requireLogin, requrieAdmin, (req, res) => {
    res.sendFile("index.html", { root: adminPath });
  });

  app.get("/admin/userStats", requireLogin, requrieAdmin, (req, res) => {
    res.sendFile("userStats.html", { root: adminPath });
  });
  // migration API only once
  // app.get("/api/migrate", migrationService.migrateFrom);

  // Set migration dates
  // migration complete
  // app.get(
  //   "/api/setMigrationDates",
  //   requireLogin,
  //   requrieAdmin,
  //   async (req, res) => {
  //     const users = await User.find({});
  //     users.forEach(async user => {
  //       let userDate = new Date(user._id.getTimestamp());
  //       user.created = userDate.getTime();
  //       await user.save();
  //     });
  //     res.json({ msg: "ok" });
  //   }
  // );

  // set coordinates, region, city for visiteds
  app.get(
    "/api/setCoords",
    requireLogin,
    requrieAdmin,
    userStatsService.setCoordsFromIP
  );

  // API to cache all the user certificates which are not cached yet
  app.get(
    "/api/certificatesCacheSync",
    requireLogin,
    requrieAdmin,
    cacheSync.syncCertificateCache
  );

  app.get(
    "/api/getAllTimestamp",
    requireLogin,
    requrieAdmin,
    userStatsService.getAllUserTimestamp
  );
  app.get(
    "/api/getUserLastQuater",
    requireLogin,
    requrieAdmin,
    userStatsService.getUserLastQuater
  );
  app.post(
    "/api/lastNDaysCreated",
    requireLogin,
    requrieAdmin,
    userStatsService.getUsersLastNDays
  );
  app.post(
    "/api/lastNDaysActive",
    requireLogin,
    requrieAdmin,
    userStatsService.getByLastActiveDay
  );

  app.post(
    "/api/getUserListUsingCode",
    requireLogin,
    requrieAdmin,
    userStatsService.getUserListUsingCode
  );

  app.get(
    "/api/getAllCodes",
    requireLogin,
    requrieAdmin,
    userStatsService.getAllCodes
  );

  app.post(
    "/api/getVisits",
    requireLogin,
    requrieAdmin,
    userStatsService.getVisits
  );

  app.get(
    "/api/getAllUserPaymentList",
    requireLogin,
    requrieAdmin,
    userStatsService.getAllUserPaymentList
  );

  app.get(
    "/api/getAllUserCertificates",
    requireLogin,
    requrieAdmin,
    userStatsService.getAllUserCertificates
  );
  // app.post(
  //   "/admin/getMostActive",
  //   requireLogin,
  //   requrieAdmin,
  //   userStatsService.getMostActive
  // );

  // prettier-ignore
  {
    app.post("/api/addCourse",requireLogin,requrieAdmin,adminServices.addCourse);
    app.post("/api/setXdceTolerance",requireLogin,requrieAdmin,adminServices.setXdceTolerance);
    app.post("/api/setXdcTolerance",requireLogin,requrieAdmin,adminServices.setXdcTolerance);
    app.post("/api/setPriceUsd",requireLogin,requrieAdmin,adminServices.setPriceUsd);
    app.post("/api/setXdceConfirmation",requireLogin,requrieAdmin,adminServices.setXdceConfirmation);
    app.post("/api/setXdcConfirmation",requireLogin,requrieAdmin,adminServices.setXdcConfirmation);
    app.post("/api/setCourseBurnPercent",requireLogin,requrieAdmin,adminServices.setCourseBurnPercent);
    app.post("/api/enableBurning",requireLogin,requrieAdmin,adminServices.enableBurning);
    app.post("/api/disableBurning",requireLogin,requrieAdmin,adminServices.disableBurning);
    app.post("/api/addWallet",requireLogin,requrieAdmin,adminServices.addWallet);
    app.post("/api/switchWalletTo",requireLogin, requrieAdmin,adminServices.switchWalletTo);
    app.post("/api/addReferralCode",requireLogin,requrieAdmin,adminServices.addReferralCode);
    app.post("/api/enableReferralCode",requireLogin, requrieAdmin,adminServices.enableRefCode);
    app.post("/api/disableReferralCode",requireLogin, requrieAdmin,adminServices.disableRefCode);
    app.get("/api/getCourseVisits",requireLogin, requrieAdmin,userStatsService.getCourseVisits);
    app.get("/api/getAllUser",requireLogin, requrieAdmin,userStatsService.getAllUser);
    app.get("/api/getAllPromoCodes",requireLogin, requrieAdmin,userStatsService.getAllPromoCodes);
    app.get("/api/getAllReferralCodes",requireLogin, requrieAdmin,userStatsService.getAllReferralCodes);
    app.get("/api/getPromoCodeLogs",requireLogin, requrieAdmin,adminServices.getPromoCodeLogs);
    app.get("/api/getPaymentLogs",requireLogin, requrieAdmin,adminServices.getPaymentLogs);
    app.get("/api/getBurnlogs",requireLogin, requrieAdmin,adminServices.getBurnLogs);
    app.get("/api/getCryptoLogs",requireLogin, requrieAdmin,adminServices.getCryptoLogs);
    app.get("/api/forcePendingBurn",requireLogin, requrieAdmin,adminServices.forcePendingBurn);
  }
};
