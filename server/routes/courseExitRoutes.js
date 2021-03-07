const requireLogin = require("../middleware/requireLogin");
const courseExit = require('../services/courseExit');
module.exports = app => {
    app.post("/api/courseExit", requireLogin, courseExit.courseExit);
    app.post("/api/getCourseExit", requireLogin, courseExit.getCourseExit);
};