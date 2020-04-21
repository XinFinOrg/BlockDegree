const fmdService = require("../services/fundMyDegree");
const requireLogin = require("../middleware/requireLogin");

module.exports = (app) => {
  app.get("/fund-my-degree", requireLogin, (req, res) => {
    res.render("fundReq");
  });
  app.get("/fmd", requireLogin, (req, res) => {
    res.redirect("/fund-my-degree");
  });
  app.post("/api/requestNewFund", requireLogin, fmdService.requestNewFund);
  app.post("/api/initiateDonation", requireLogin, fmdService.initiateDonation);
  app.get("/api/getUserFundReq", requireLogin, fmdService.getUserFundReq);
  app.get(
    "/api/getUninitiatedFund",
    requireLogin,
    fmdService.getUninitiatedFunds
  );
  app.get("/api/getAllFunds", requireLogin, fmdService.getAllFunds);
  app.get("/api/getUserFMDFunded", requireLogin, fmdService.getUserFMDFunded);
  app.post("/fmd-pay-paypal", requireLogin, fmdService.startFundPaypal);
  app.get("/fmd-pay-paypal-suc", requireLogin, fmdService.successFundPaypal);
  app.post("/api/claimFund", requireLogin, fmdService.claimFund);
  app.post("/pay/razor", (req, res) => {
    console.log(req.body);
  });

  app.post("/api/initiateRazorpay", requireLogin, fmdService.initiateRazorpay);
  app.post("/api/completeRazorpay", requireLogin, fmdService.completeRazorpay);
};
