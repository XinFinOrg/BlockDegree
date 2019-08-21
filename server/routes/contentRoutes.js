var requireLogin = require('../middleware/requireLogin');
var courseService = require('../services/content');

module.exports = app => {
    app.get("/courses/:courseName",requireLogin,courseService.renderCourses);
    app.get("/courses/:courseName/:content",requireLogin,courseService.renderCourseContent);
}