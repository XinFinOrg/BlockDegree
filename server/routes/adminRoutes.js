const requireLogin = require("../middleware/requireLogin");
const requrieAdmin = require("../middleware/requireAdmin");
const path = require("path");
const adminPath = path.join(__dirname, "../admin/");
const migrationService = require("../services/migrate");
const userStatsService = require("../services/userStats");
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
  // app.post(
  //   "/admin/getMostActive",
  //   requireLogin,
  //   requrieAdmin,
  //   userStatsService.getMostActive
  // );
};
