let EventEmitter = require("events").EventEmitter;
const PaymentToken = require("../models/payment_token");
const User = require("../models/user");
const Web3 = require("web3");

let eventEmitter = new EventEmitter();
const ethConfirmation = 3;
const xinConfirmation = 3;

function listenForConfirmation(txHash, network, userEmail) {
  setImmediate(async () => {
    console.log(
      `Listening for the confirmation for the hash: ${txHash} on the network-id: ${network}`
    );
    switch (network) {
      case 1: {
        const web3 = new Web3(
          new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
        );
        try {
          const txReceipt = await web3.eth.getTransactionReceipt(txHash);
          if (txReceipt == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason: no receipt found`
            );
            return;
          }
          const paymentLog = await PaymentToken.findOne({ txn_hash: txHash });
          if (paymentLog == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason: no payment log found`
            );
            return;
          }
          const user = await User.findOne({ email: userEmail });
          if (user == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason no user found`
            );
            return;
          }
          const txBlockNumber = txReceipt.blockNumber;
          if (paymentLog.status === "pending") {
            // in proper state, start listening for the confimations
            let ConfirmationInterval = setInterval(async () => {
              console.log("Interval for confimation");
              const currBlockNumber = await web3.eth.getBlockNumber();
              if (currBlockNumber - txBlockNumber >= ethConfirmation) {
                // alright, payment can now be completed
                paymentLog.status = "completed";
                user.examData.payment[paymentLog.course] = true;
                await paymentLog.save();
                await user.save();
                console.log(
                  `Finished listening for the tx ${txHash}; reason: successfully completed the order`
                );
                clearInterval(ConfirmationInterval);
              }
            }, 5000);
          } else {
            console.log(
              `Finished listening for the tx ${txHash}; reason: status mismatch -> ${paymentLog.status}`
            );
            return;
          }
        } catch (e) {
          console.error(
            `Some error has occured while listening for tx: ${txHash}: `,
            e
          );
        }
      }
      case 4: {
      }
      case 50: {
      }
      default: {
        console.error(
          `No listener registered for gthe chain with networkid ${network}: `
        );
      }
    }
  });
}

eventEmitter.on("listenTx", listenForConfirmation);

exports.em = eventEmitter;
