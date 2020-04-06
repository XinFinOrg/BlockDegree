const fmdService = require("../services/fundMyDegree");

module.exports = (app) => {
  app.get("/fund-my-degree", (req, res) => {
    res.render("fundReq");
  });
  app.get("/fmd", (req, res) => {
    res.redirect("/fund-my-degree");
  });
  app.post("/api/requestNewFund", fmdService.requestNewFund);
  app.post("/api/initiateDonation", fmdService.initiateDonation);
  app.get("/api/getUninitiatedFund", fmdService.getUninitiatedFunds);
};
