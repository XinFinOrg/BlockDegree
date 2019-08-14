const User = require("../models/user");

module.exports = async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email }).catch(e => {
    console.log(`Exception in finding user ${req.user.email} ${e}`),
      res.redirect("/"); // replace by error page
  });
  if (!user) {
    console.log(`User ${req.user.email} not found`);
    res.redirect("/"); // replace by error page
  }
  if (user.profile == {}) {
    // empty profile, profile not set
    res.redirect("/"); // replace by set profile page
  } else {
    next();
  }
};
