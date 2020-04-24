module.exports = (req, res, next) => {
  console.log("Query for handle Close ", req.query);
  if (req.query.close == "true") {
    // its a pop-up, close on completion.
    console.log("inside close is true . .");
    req.session.closeOnCallback = true;
    req.session.shareModal = req.query.share;
  }
  next();
};
