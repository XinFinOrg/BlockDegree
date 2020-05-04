/**
 * removeExpo will remove exponentials from the number
 * @param {Number | String} x the number which needs to converted into string
 */
exports.removeExpo = (x) => {
  var data = String(x).split(/[eE]/);
  if (data.length == 1) return data[0];

  var z = "",
    sign = x < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
};

/**
 * will return if the addresses are equal are not
 * @param {string} addr1 first address
 * @param {string} addr2 ssecond address
 * @return {boolean}
 */
exports.equateAddress = (addr1, addr2) => {
  if (addr1 === undefined || addr2 === undefined) return false;
  return addr1.trim().toLowerCase() === addr2.trim().toLowerCase();
};

/**
 * will return a rnd string with bd- prefix
 * @returns{String}
 */
exports.genRandomAlphaNum = () => {
  const length = 10;
  const set = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += set[Math.floor(Math.random() * set.length)];
  }
  return `bd-${result}`;
};
