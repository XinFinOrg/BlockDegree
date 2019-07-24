var examServices = require("../services/exam");
var requireLogin = require("../middleware/requireLogin");
var hasSubscribed = require("../middleware/courseSubscribed");

module.exports = app => {
  app.post("/postExam", requireLogin, examServices.submitExam);
  app.get("/exam-result", requireLogin, examServices.getExamResult);
  app.get("/exams", requireLogin, examServices.getExamStatus);
  app.get(
    "/blockchain-basic-exam",
    requireLogin,
    hasSubscribed,
    examServices.getBasicExam
  );
  app.get(
    "/blockchain-professional-exam",
    requireLogin,
    hasSubscribed,
    examServices.getProfessionalExam
  );
  app.get(
    "/blockchain-advanced-exam",
    requireLogin,
    hasSubscribed,
    examServices.getAdvancedExam
  );
};
