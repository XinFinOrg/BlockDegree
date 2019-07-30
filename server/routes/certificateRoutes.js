const certificateServices = require("../services/retriveCertificate");
const requireLogin = require("../middleware/requireLogin");

module.exports = app => {
    app.get("/api/getAllCertificates",requireLogin,certificateServices.getAllCertificates)
}