require("dotenv").config();

module.exports = (req, res, next) => {
  if (process.env.ADMIN_ID.split("|").includes(req.user.email)) {
    next();
  } else {
    res.render("error");
  }
};
