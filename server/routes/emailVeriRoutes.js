const verficationServices = require("../services/emailVerification");

module.exports = app => {
    app.get("/confirmation",verficationServices.confirmEmail);
    app.post("/resend",verficationServices.resendEmail);
}