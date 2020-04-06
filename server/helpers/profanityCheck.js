const _ = require("lodash");
const spawn = require("child_process").spawn;

/**
 * returns true / false if the text contains / doesn't contain profanity
 * @param {string} text text to check for profanity
 * @returns {Promise<boolean>}
 */
exports.checkForProfinity = text => {
  return new Promise((resolve, reject) => {
    if (_.isEmpty(text)) {
      reject("empty text");
    }
    const process = spawn("python", ["./test.py", text]);
    process.stdout.on("data", function(data) {
      data = data.toString("utf-8").trim();
      const hasProfanity = data === "[1]";
      resolve(hasProfanity);
    });
  });
};
