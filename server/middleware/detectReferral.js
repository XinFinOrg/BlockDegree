const _ = require("lodash");

module.exports = (req, res, next) => {
  console.log("called detectReferral: ", req.query);
  
  if (!_.isEmpty(req.query.refId)) {
    req.session.refIdUsed = true;
    req.session.refIdValue = req.query.refId;
  }
  next();
};
