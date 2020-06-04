const GeoIP = require("geoip-lite");

let allowedCountryCode = ["IN"];
// let allowedCountryCode = [""];

module.exports = (req, res, next) => {
  const fromIP = req.headers["x-forwarded-for"] || req.ip;
  let geo = GeoIP.lookup(fromIP);
  if (geo !== null) {
    let country = geo.country;
    if (allowedCountryCode.includes(country)) {
      next();
    } else {
      return res.json({ staus: false, error: "not allowed" });
    }
  } else {
    return res.json({ staus: false, error: "not allowed" });
  }
};
