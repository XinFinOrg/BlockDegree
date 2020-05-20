const corporateFundingService = require("../services/corporateFundingServices");
const fmdService = require("../services/fundMyDegree");

module.exports = (app) => {
  app.post("/api/getBulkAdress", corporateFundingService.generateBulkAddress);
  app.get("/api/getAllFundsCorp", fmdService.getAllFundsCorp);
};
