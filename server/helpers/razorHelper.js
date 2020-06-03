const Razorpay = require("razorpay");
const razorKeys = require("../config/razorPayKeys");
const { usdToInr, roundDgt } = require("../helpers/common");
const _ = require("lodash");

let instance = new Razorpay({
  key_id: razorKeys.keyId,
  key_secret: razorKeys.keySecret,
});

let options = {
  amount: 50000, // amount in the smallest currency unit
  currency: "INR",
  receipt: "order_rcptid_11",
  payment_capture: "0",
};

// instance.orders.create(options, function (err, order) {
//   console.log(order);
// });

exports.createNewOrder = (receipt, amntUsd) => {
  return new Promise((resolve, reject) => {
    if (!_.isNumber(amntUsd) && _.isEmpty(receipt)) {
      reject("invalid / missing parameters");
      return;
    }
    usdToInr(amntUsd)
      .then((amount) => {
        options.receipt = receipt;
        // options.amount = roundDgt(amount, 2) * 100;
        options.amount = roundDgt(10, 2) * 100;
        instance.orders.create(options, function (err, order) {
          if (err) {
            reject(err);
            return;
          }
          resolve(order);
        });
      })
      .catch((e) => {
        console.log(`exception at ${__filename}.createNewOrder: `, e);
        reject(e);
      });
  });
};
