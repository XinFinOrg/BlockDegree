const EventEmitter = require("events").EventEmitter;
const PaymentToken = require("../models/payment_token");
const txnListener = require("../listeners/txnConfirmation");
const emailer = require("../emailer/impl");

let eventEmitter = new EventEmitter();

async function pendingTx() {
  setImmediate(async () => {
    try {
      console.log("started the pending TX listener");
      const pendingTokens = await PaymentToken.find({ $or:[{status: "pending"},{status:"not yet mined"}] });
      if (pendingTokens != null) {
        console.log("We got " + pendingTokens.length + " pending txns.");
        for (let z = 0; z < pendingTokens.length; z++) {
          if (pendingTokens[z].payment_network != undefined)
          txnListener.em.emit(
            "listenTxConfirm",
            pendingTokens[z].txn_hash,
            pendingTokens[z].payment_network,
            pendingTokens[z].email,
            pendingTokens[z].course
          )
          else console.log(`(${z+1}) Found incomplete TX ${pendingTokens[z].txn_hash} of user ${pendingTokens[z].email} on unknown network.`);
        }
      } else {
        console.log("No pending transactions, yeah.");
      }
    } catch (e) {
      console.error("Some error occured at listeners.pendingTx: ", e);
      await emailer.sendMail(process.env.SUPP_EMAIL_ID);
      return;
    }
  });
}

eventEmitter.on("initiatePendingTx",pendingTx);
exports.em = eventEmitter;
