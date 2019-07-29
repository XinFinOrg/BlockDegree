var shareServices = require("../services/shareSocials");

module.exports = app => {
    // no authentication required for testing
    app.post("/api/shareOnTwitter",shareServices.postTwitter);
    app.post("/api/shareOnLinkedin",shareServices.postLinkedin);

    app.get("/api/shareOnTwitter",shareServices.postTwitter);
    app.get("/api/shareOnLinkedin",shareServices.postLinkedin);

    app.post("/api/uploadImageLinkedin",shareServices.uploadImageLinkedin);
}