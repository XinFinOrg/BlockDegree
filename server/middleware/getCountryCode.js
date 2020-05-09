const GeoIP = require("geoip-lite");

module.exports = (req, res, next) => {
  const fromIP = req.headers["x-forwarded-for"] || req.ip;
  let geo = GeoIP.lookup(fromIP);
  let country = null;
  if (geo !== null) country = geo.country;
  req.session.country = country;
  next();
};
