const fmdService = require("../services/fundMyDegree");
const countryRestrictedApi = require("../middleware/countryRestrictedApi");
const getCountryCode = require("../middleware/getCountryCode");
const requireLogin = require("../middleware/requireLogin");

module.exports = (app) => {
  app.get("/fmd-corporate-paypal-suc", fmdService.fmdCorporatePaypalSuc);
  app.get("/fmd-corporate-paypal-err", fmdService.fmdCorporatePaypalErr);
  app.get("/fmd", requireLogin, (req, res) => {
    res.redirect("/fund-my-degree");
  });
  app.get("/fund-my-degree-fund", requireLogin, getCountryCode, (req, res) => {
    res.render("fundReqFund", { country: req.session.country });
  });
  app.get("/fmd-fund", requireLogin, (req, res) => {
    res.redirect("/fund-my-degree-fund");
  });
  app.get("/fund-my-degree-apply", requireLogin, (req, res) => {
    res.render("fundReqApply");
  });
  app.get("/fmd-apply", requireLogin, (req, res) => {
    res.redirect("/fund-my-degree-apply");
  });
  app.post("/api/requestNewFund", requireLogin, fmdService.requestNewFund);
  app.post("/api/initiateDonation", requireLogin, fmdService.initiateDonation);
  app.get("/api/getUserFundReq", requireLogin, fmdService.getUserFundReq);
  app.get(
    "/api/getUninitiatedFund",
    requireLogin,
    fmdService.getUninitiatedFunds
  );
  app.get("/api/getAllFunds", requireLogin,getCountryCode, fmdService.getAllFunds);
  app.get("/api/getUserFMDFunded", requireLogin, fmdService.getUserFMDFunded);
  app.post("/fmd-pay-paypal", requireLogin, fmdService.startFundPaypal);
  app.get("/fmd-pay-paypal-suc", requireLogin, fmdService.successFundPaypal);
  app.post("/api/claimFund", requireLogin, fmdService.claimFund);
  app.post("/pay/razor", (req, res) => {
    console.log(req.body);
  });

  app.post(
    "/api/initiateRazorpay",
    requireLogin,
    countryRestrictedApi,
    fmdService.initiateRazorpay
  );
  app.post(
    "/api/completeRazorpayFMD",
    requireLogin,
    countryRestrictedApi,
    fmdService.completeRazorpay
  );
  app.post(
    "/api/startCorporateCoursePaymentPaypal",
    fmdService.startCorporateCoursePaymentPaypal
  );
  app.post(
    "/api/startCorporateCoursePaymentXdc",
    fmdService.startCorporateCoursePaymentXdc
  );
};
