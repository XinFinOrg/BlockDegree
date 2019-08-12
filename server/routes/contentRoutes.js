const migrationService = require("../services/migrate");
var requireLogin = require('../middleware/requireLogin');
var courseService = require('../services/content');

module.exports = app => {
    app.get("/courses/:courseName",requireLogin,courseService.renderCourses);
    app.get("/courses/:courseName/:content",requireLogin,courseService.renderCourseContent);

    // temp
    app.get("/api/migrate",migrationService.migrateFrom);
}