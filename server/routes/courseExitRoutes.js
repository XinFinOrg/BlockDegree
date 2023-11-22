const requireLogin = require("../middleware/requireLogin");
const CourseExit = require('../services/courseExit');
module.exports = app => {
    app.post("/api/course_exit", requireLogin, CourseExit.course_exit);
    app.post("/api/getCourseExit", requireLogin, CourseExit.getCourseExit);
};