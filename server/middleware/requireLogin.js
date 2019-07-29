module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.redirectTo = req.originalUrl;
    if (req.params.courseName) {
      res.redirect("/login?from=" + req.params.courseName);
    } else {
      res.redirect("/login");
    }
  }
};
