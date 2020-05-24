const corporateFundingService = require("../services/corporateFundingServices");
const fmdService = require("../services/fundMyDegree");

module.exports = (app) => {
  app.post("/api/getBulkAddress", corporateFundingService.generateBulkAddress);
  app.post("/api/corp-pay-paypal", corporateFundingService.startPaymentPaypal);
  app.get(
    "/api/corp-pay-paypal-suc",
    corporateFundingService.paymentPaypalSuccess
  );
  app.get(
    "/api/corp-pay-paypal-err",
    corporateFundingService.paymentPaypalError
  );

  app.get("/api/getAllFundsCorp", fmdService.getAllFundsCorp);
  app.post(
    "/api/updadteCompanyLogo",
    corporateFundingService.updateCompanyLogo
  );
  app.post("/api/updateProfile", corporateFundingService.updateProfile);
  app.get("/api/getCorpFunding", corporateFundingService.getCorpFunding);
};
