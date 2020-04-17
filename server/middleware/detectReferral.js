const _ = require("lodash");

module.exports = (req, res, next) => {
  if (!_.isEmpty(req.query.refId)) {
    req.session.refIdUsed = true;
    req.session.refIdValue = req.query.refId;
  }
  next();
};
