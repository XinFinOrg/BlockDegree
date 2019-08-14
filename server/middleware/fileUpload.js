const multer = require("multer");
const upload = multer({ dest: __dirname + "/uploads/images" });
const crypto = require("crypto");

module.exports = async (req, res, next) => {
  const name = crypto.randomBytes(20).toString("hex");
  upload.single(name);
  res.locals.file_name = name;
  next();
};
