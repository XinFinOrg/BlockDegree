const requireLogin = require("../middleware/requireLogin");
const courseExit = require('../services/courseExit');
module.exports = app => {
    app.post("/api/qna", requireLogin, courseExit.courseExit);
    app.post("/api/getQna", requireLogin, courseExit.getCourseExit);
};