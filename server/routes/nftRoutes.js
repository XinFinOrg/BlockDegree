const nftService = require("../services/nft");
const requireLogin = require("../middleware/requireLogin");

module.exports = (app) => {
  app.post("/api/mint-nft", requireLogin, nftService.MintNft);
};
