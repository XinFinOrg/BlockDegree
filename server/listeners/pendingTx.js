const EventEmitter = require("events").EventEmitter;
const PaymentToken = require("../models/payment_token");
const PaymentLog = require("../models/payment_logs");
const UserFundReq = require("../models/userFundRequest");
const burnEmitter = require("../listeners/burnToken").em;
const txnListener = require("../listeners/txnConfirmation");
const emailer = require("../emailer/impl");

let eventEmitter = new EventEmitter();

async function pendingTx() {
  setImmediate(async () => {
    try {
      console.log("started the pending TX listener");
      const pendingTokens = await PaymentToken.find({
        $or: [{ status: "pending" }, { status: "not yet mined" }],
      });
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
            );
          else
            console.log(
              `(${z + 1}) Found incomplete TX ${
                pendingTokens[z].txn_hash
              } of user ${pendingTokens[z].email} on unknown network.`
            );
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

async function pendingBurn() {
  console.log("called pending burn");
  try {
    const paymentLogs = await PaymentLog.find({
      burnStatus: "awaiting balance",
    });
    console.log("awaiting logs");
    if (paymentLogs == null || paymentLogs.length == 0) {
      console.log("[*] no pending burn for paypal");
    }
    let count = 0;
    paymentLogs.forEach((log) => {
      // is awaiting balance
      console.log(log);
      burnEmitter.emit(
        "burnTokenPaypal",
        log.payment_id,
        log.payment_amount || 10,
        "50",
        log.course_id,
        log.email,
        count++
      );
    });

    let newCount = 0;
    const pendingBurnToken = await PaymentToken.find({
      $and: [{ status: "completed", burn_txn_hash: "" }],
    });
    if (pendingBurnToken !== null) {
      pendingBurnToken.forEach((currPayment) => {
        txnListener.em.emit(
          "handleBurnToken",
          currPayment.course,
          currPayment.txn_hash,
          currPayment.payment_id,
          currPayment.email,
          "xdc",
          newCount++
        );
      });
      console.log(`[*] initiated burn for ${newCount} payments`);      
    }
  } catch (e) {
    console.error("exception at pendingTx:");
    console.error(e);
  }
}

async function syncPendingBurnFMD(all) {
  try {
    console.log("called syncPendingBurnFMD: ", all, all === true);

    let allFMD;
    if (all === true) {
      allFMD = await UserFundReq.find({
        $and: [
          { status: "completed" },
          { $or: [{ burnStatus: "uninitiated" }, { burnStatus: "pending" }] },
        ],
      });
    } else {
      allFMD = await UserFundReq.find({
        $and: [{ status: "completed" }, { burnStatus: "uninitiated" }],
      });
    }

    let count = 0;
    allFMD.forEach((currReq) => {
      burnEmitter.emit("donationTokenBurn", currReq.fundId, count++);
    });
  } catch (e) {
    console.log(`exception at ${__filename}.syncPendingBurnFMD: `, e);
  }
}

eventEmitter.on("initiatePendingTx", pendingTx);
eventEmitter.on("initiatePendingBurn", pendingBurn);
eventEmitter.on("syncPendingBurnFMD", syncPendingBurnFMD);

exports.em = eventEmitter;
