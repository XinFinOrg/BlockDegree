const GeoIP = require("geoip-lite");

let allowedCountryCode = ["IND"];

module.exports = (req, res, next) => {
  const fromIP = req.headers["x-forwarded-for"] || req.ip;
  let geo = GeoIP.lookup(fromIP);
  if (geo !== null) {
    let country = geo.country;
    if (allowedCountryCode.includes(country)) {
      next();
    }
    return res.json({ staus: false, error: "not allowed" });
  }
  return res.json({ staus: false, error: "not allowed" });
};
