const axios = require("axios");

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

/**
 * Will convert amount in USd to amount in INR
 * @param {String|Number} amntUsd amount in USD
 */
exports.usdToInr = (amntUsd) => {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.exchangeratesapi.io/latest?base=USD")
      .then((result) => {
        const inrRate = result.data.rates.INR;
        resolve(parseFloat(amntUsd) * parseFloat(inrRate));
      })
      .catch((e) => {
        console.log(`exception at ${__filename}.usdToInr: `, e);
        reject(e);
      });
  });
};

exports.roundDgt = (amount, dgt) => {
  return Math.round(parseFloat(amount * Math.pow(10, dgt))) / Math.pow(10, dgt);
};

exports.GetMonthDays = GetMonthDays;

exports.isLeapYear = isLeapYear;

exports.MonthNoToWord = MonthNoToWord;

/**
 *
 * @param {String} month - month number -starting from 0
 * @param {String} year - year in YYYY
 */
function GetMonthDays(month, year) {
  switch (`${month}`) {
    case `0`: {
    }
    case `2`: {
    }
    case `4`: {
    }
    case `6`: {
    }
    case `7`: {
    }
    case `9`: {
    }
    case `11`: {
      return 31;
    }
    case `1`: {
      if (isLeapYear(parseInt(year)) === true) return 29;
      return 28;
    }

    case `3`: {
    }
    case `5`: {
    }
    case `8`: {
    }
    case `10`: {
      return 30;
    }
  }
}

/**
 *
 * @param {String} yr - year in YYYY
 */
function isLeapYear(yr) {
  if (yr % 100 === 0) {
    return yr % 400 === 0;
  } else {
    return yr % 4 === 0;
  }
}

/**
 *
 * @param {Number|String} month month number  - starting from 0
 */
function MonthNoToWord(month) {
  switch (`${month}`) {
    case `0`: {
      return "january";
    }
    case `2`: {
      return "march";
    }
    case `4`: {
      return "may";
    }
    case `6`: {
      return "july";
    }
    case `7`: {
      return "august";
    }
    case `9`: {
      return "october";
    }
    case `11`: {
      return "december";
    }
    case `1`: {
      return "febuary";
    }

    case `3`: {
      return "april";
    }
    case `5`: {
      return "june";
    }
    case `8`: {
      return "september";
    }
    case `10`: {
      return "november";
    }
  }
}
