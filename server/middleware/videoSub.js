const User = require("../models/user");
module.exports = async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });
  if (user.videoSubscription == true) {
    next();
  } else {
    res.render("error");
  }
};