module.exports = (req, res, next) => {
  if (req.query.close=="true"){
      // its a pop-up, close on completion.
      req.session.closeOnCallback=true;
  }
  next();
};
