module.exports = (req, res, next) => {
  console.log(req.query);
  if (req.query.close == "true") {
    // its a pop-up, close on completion.
    req.session.closeOnCallback = true;
  }
  next();
};
