const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");
const path = require("path");
const adminPath = path.join(__dirname, "../admin/");
const migrationService = require("../services/migrate");
const userStatsService = require("../services/userStats");
const adminServices = require("../services/adminServices");
const postSocial = require("../services/postSocials");
const cacheSync = require("../services/cacheSync");
const User = require("../models/user");
const multer = require("multer");
let storage = multer.memoryStorage()
let upload = multer({ storage: storage })

module.exports = app => {
  app.get("/admin", requireLogin, requireAdmin, (req, res) => {
    res.sendFile("index.html", { root: adminPath });
  });

  app.get("/admin/userStats", requireLogin, requireAdmin, (req, res) => {
    res.sendFile("userStats.html", { root: adminPath });
  });
  // migration API only once
  // app.get("/api/migrate", migrationService.migrateFrom);

  // Set migration dates
  // migration complete
  // app.get(
  //   "/api/setMigrationDates",
  //   requireLogin,
  //   requireAdmin,
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
    requireAdmin,
    userStatsService.setCoordsFromIP
  );

  // API to cache all the user certificates which are not cached yet
  app.get(
    "/api/certificatesCacheSync",
    requireLogin,
    requireAdmin,
    cacheSync.syncCertificateCache
  );

  app.get(
    "/api/getAllTimestamp",
    requireLogin,
    requireAdmin,
    userStatsService.getAllUserTimestamp
  );
  app.get(
    "/api/getUserLastQuater",
    requireLogin,
    requireAdmin,
    userStatsService.getUserLastQuater
  );
  app.post(
    "/api/lastNDaysCreated",
    requireLogin,
    requireAdmin,
    userStatsService.getUsersLastNDays
  );
  app.post(
    "/api/lastNDaysActive",
    requireLogin,
    requireAdmin,
    userStatsService.getByLastActiveDay
  );

  app.post(
    "/api/getUserListUsingCode",
    requireLogin,
    requireAdmin,
    userStatsService.getUserListUsingCode
  );

  app.get(
    "/api/getAllCodes",
    requireLogin,
    requireAdmin,
    userStatsService.getAllCodes
  );

  app.post(
    "/api/getVisits",
    requireLogin,
    requireAdmin,
    userStatsService.getVisits
  );

  app.get(
    "/api/getAllUserPaymentList",
    requireLogin,
    requireAdmin,
    userStatsService.getAllUserPaymentList
  );

  app.get(
    "/api/getAllUserCertificates",
    requireLogin,
    requireAdmin,
    userStatsService.getAllUserCertificates
  );
  // app.post(
  //   "/admin/getMostActive",
  //   requireLogin,
  //   requireAdmin,
  //   userStatsService.getMostActive
  // );

  // prettier-ignore
  {
    app.post("/api/addCourse",requireLogin,requireAdmin,adminServices.addCourse);
    app.post("/api/setXdceTolerance",requireLogin,requireAdmin,adminServices.setXdceTolerance);
    app.post("/api/setXdcTolerance",requireLogin,requireAdmin,adminServices.setXdcTolerance);
    app.post("/api/setPriceUsd",requireLogin,requireAdmin,adminServices.setPriceUsd);
    app.post("/api/setXdceConfirmation",requireLogin,requireAdmin,adminServices.setXdceConfirmation);
    app.post("/api/setXdcConfirmation",requireLogin,requireAdmin,adminServices.setXdcConfirmation);
    app.post("/api/setCourseBurnPercent",requireLogin,requireAdmin,adminServices.setCourseBurnPercent);
    app.post("/api/enableBurning",requireLogin,requireAdmin,adminServices.enableBurning);
    app.post("/api/disableBurning",requireLogin,requireAdmin,adminServices.disableBurning);
    app.post("/api/addWallet",requireLogin,requireAdmin,adminServices.addWallet);
    app.post("/api/switchWalletTo",requireLogin, requireAdmin,adminServices.switchWalletTo);
    app.post("/api/addReferralCode",requireLogin,requireAdmin,adminServices.addReferralCode);
    app.post("/api/enableReferralCode",requireLogin, requireAdmin,adminServices.enableRefCode);
    app.post("/api/disableReferralCode",requireLogin, requireAdmin,adminServices.disableRefCode);
    app.get("/api/getCourseVisits",requireLogin, requireAdmin,userStatsService.getCourseVisits);
    app.get("/api/getAllUser",requireLogin, requireAdmin,userStatsService.getAllUser);
    app.get("/api/getAllPromoCodes",requireLogin, requireAdmin,userStatsService.getAllPromoCodes);
    app.get("/api/getAllReferralCodes",requireLogin, requireAdmin,userStatsService.getAllReferralCodes);
    app.get("/api/getPromoCodeLogs",requireLogin, requireAdmin,adminServices.getPromoCodeLogs);
    app.get("/api/getPaymentLogs",requireLogin, requireAdmin,adminServices.getPaymentLogs);
    app.get("/api/getBurnlogs",requireLogin, requireAdmin,adminServices.getBurnLogs);
    app.get("/api/getCryptoLogs",requireLogin, requireAdmin,adminServices.getCryptoLogs);
    app.get("/api/forcePendingBurn",requireLogin, requireAdmin,adminServices.forcePendingBurn);
    app.post("/api/scheduleEventByTime",postSocial.scheduleEventByTime);
    app.post("/api/addPostTemplate",postSocial.addPostTemplate);
  }
};
