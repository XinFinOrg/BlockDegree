var shareServices = require("../services/shareSocials");

module.exports = app => {

    app.post("/api/shareOnTwitter",shareServices.postTwitter);
    app.post("/api/shareOnLinkedin",shareServices.postLinkedin);
    app.post("/api/shareOnFacebook",shareServices.postFacebook);
    // Not working : issue in uploading image to uploadURL; tried cURL, HTTPie, axios
    app.post("/api/uploadImageLinkedin",shareServices.uploadImageLinkedin);
}