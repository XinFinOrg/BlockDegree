const requireLogin = require("../middleware/requireLogin");
const requrieAdmin = require("../middleware/requireAdmin");
const path = require("path")
const adminPath = path.join(__dirname,"../admin/");

module.exports = app => {
  app.get("/admin", requireLogin, requrieAdmin, (req, res) => {
    console.log("Called admin");
    res.sendFile("index.html", { root: adminPath });
  });
};
