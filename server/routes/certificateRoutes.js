const certificateServices = require("../services/retriveCertificate");
const requireLogin = require("../middleware/requireLogin");

module.exports = app => {
    app.get("/api/getAllCertificates",requireLogin,certificateServices.getAllCertificates)
    app.post("/api/downloadCertificate",requireLogin,certificateServices.downloadCertificate)
    app.post("/api/getCertificateFromCourse",requireLogin,certificateServices.getCertificatesFromCourse)
}