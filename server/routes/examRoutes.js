var examServices = require("../services/exam");
var requireLogin = require("../middleware/requireLogin");
var hasSubscribed = require("../middleware/courseSubscribed");

module.exports = app => {
  app.get("/take-exam/:urlSlug", requireLogin, examServices.takeExam);
  app.get("/schedule-exam", requireLogin, examServices.scheduleExam);
  app.post("/api/examSchedule/:urlSlug/submit", requireLogin, examServices.submitExamSchedule);
  app.post("/api/examSchedule/:urlSlug/attempt", requireLogin, examServices.attemptExamSchedule);
  app.post("/api/examSchedule/:urlSlug", requireLogin, examServices.updateExamSchedule);
  app.get("/api/examSchedules/submitted", examServices.getAllSubmittedExamSchedule);
  app.post("/api/examSchedules", requireLogin, examServices.createExamSchedule);
  app.post("/api/uploadUserRecording", requireLogin, examServices.uploadUserRecording);
  app.post("/api/uploadScreenRecording", requireLogin, examServices.uploadScreenRecording);
  app.get("/api/examAttempts/examSchedule/:urlSlug", examServices.getExamAttemptsFromExamSchedulesSlug);
  app.post("/api/examAttempt/marks", examServices.setMarks);
  app.post("/api/examAttempt/userRecordingFileName", requireLogin, examServices.attemptExamUserRecordingFileName);
  app.post("/api/examAttempt/screenRecordingFileName", requireLogin, examServices.attemptExamScreenRecordingFileName);
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
  app.get(
    "/cloud-computing-exam",
    requireLogin,
    hasSubscribed,
    examServices.getCCExam
  );

  app.get(
    "/blockchain-wallet-exam",
    requireLogin,
    hasSubscribed,
    examServices.getBlockchainWalletExam
  );
};
