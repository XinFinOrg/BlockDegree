const contactUsService = require("../services/contactUs");

module.exports = app => {
    app.post("/contactUs",contactUsService.contactUs);
}