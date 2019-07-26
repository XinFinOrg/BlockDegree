var shareServices = require("../services/shareSocials");

module.exports = app => {
    // no authentication required for testing
    app.post("/api/shareOnTwitter",shareServices.postTwitter);
}