const requireLogin = require("../middleware/requireLogin");
var forumQuestionsService = require("../services/forumQuestions");

module.exports = (app) => {
    app.get("/questions/:urlSlug", forumQuestionsService.renderforumQuestion);
    app.get("/ask-question", requireLogin, (req, res) => {
        res.render("askForumQuestion");
    });
    app.get("/forum/ask-question", (req, res) => {
        res.redirect("/ask-question");
    });
    app.post("/api/forumQuestions", requireLogin, forumQuestionsService.create);
    app.get("/api/forumQuestions", forumQuestionsService.findAll);
    app.get("/api/forumQuestions/:urlSlug", requireLogin, forumQuestionsService.findOne);
    app.post("/api/forumQuestions/:urlSlug/addAnswer", requireLogin, forumQuestionsService.addAnswer);
    app.post("/api/forumQuestions/:urlSlug/addComment/:answerId", requireLogin, forumQuestionsService.addComment);
};
