let EventEmitter = require("events").EventEmitter;
const PaymentToken = require("../models/payment_token");
const CoursePrice = require("../models/coursePrice");
const Notification = require("../models/notifications");
const BurnLog = require("../models/burn_logs");
const User = require("../models/user");
const Web3 = require("web3");
const XDC3 = require("xdc3");
const contractConfig = require("../config/smartContractConfig");
const keyConfig = require("../config/keyConfig");
const AllWallet = require("../models/wallet");
const uuidv4 = require("uuid/v4");
const abiDecoder = require("abi-decoder");
const axios = require("axios");
const promoCodeService = require("../services/promoCodes");
const emailer = require("../emailer/impl");
const EthereumTx = require("ethereumjs-tx");

let eventEmitter = new EventEmitter();
// const ethConfirmation = 3;
// const xinConfirmation = 3;
const contractAddrRinkeby = contractConfig.address.rinkeby;
const contractABI = contractConfig.ABI;
const xdceAddrMainnet = contractConfig.address.xdceMainnet;
const xdceABI = contractConfig.XdceABI;

const xdceOwnerPubAddr = "0x4F85F740aCDCf01DF73Be4EB9558247E573097ff";
const blockdegreePubAddr = "0x4F85F740aCDCf01DF73Be4EB9558247E573097ff";
const blockdegreePubAddrXDCApothm =
  "0x289da729d69ce09de5b543bc40be01e2cd9c1227";
const xdcOwnerPubAddr = "xdc289da729d69ce09de5b543bc40be01e2cd9c1227";

const xinfinApothemRPC = "http://rpc.xinfin.network";

const txReceiptUrlApothem = "https://explorer.xinfin.network/transactionRelay"; // make a POST with {isTransfer:false,tx:'abc'}

// 0x3C7a500D32C3A8317c943293c2a123A0456aa2D0 - test on rinkeBy
// 0x4F85F740aCDCf01DF73Be4EB9558247E573097ff - on mainnet
// const xdceOwnerPubAddr = await getXDCeRecipient();
// let blockdegreePubAddr = "";
// test();
// async function test() {
//   blockdegreePubAddr = await getXDCeRecipient();
//   console.log("blockdegree public address set");
// }
const burnAddress = "0x0000000000000000000000000000000000000000";
const coinMarketCapAPI =
  "https://api.coinmarketcap.com/v1/ticker/xinfin-network/";
// const xdcePrice = 10;
const xdcPrice = 10;
const XDCE = "xdce";
const XDC = "xdc";

// const xdceTolerance = 10; // tolerance set to 5 percent of principal value.

const divisor = 1; // for testing purposes 1 million'th of actual value will be used

abiDecoder.addABI(xdceABI);

function listenForConfirmation(
  txHash,
  network,
  userEmail,
  course,
  newNotiId,
  codeName,
  refCode
) {
  console.log("CodeName: ", codeName);
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
          const coursePrice = await CoursePrice.findOne({ courseId: course });
          const ethConfirmation = coursePrice.xdceConfirmation;
          if (txReceipt == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason: no receipt found`
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `TxReceipt was null. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
            );
            return;
          }
          const paymentLog = await PaymentToken.findOne({ txn_hash: txHash });
          if (paymentLog == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason: no payment log found`
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `Payment log was null. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
            );
            return;
          }
          const user = await User.findOne({ email: userEmail });
          if (user == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason no user found`
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `User was null. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
            );
            return;
          }
          const txBlockNumber = txReceipt.blockNumber;
          if (paymentLog.status === "pending") {
            let blockSubscription = web3.eth
              .subscribe("newBlockHeaders", async (err, result) => {
                if (err) {
                  console.error(
                    `Some error has occured while starting the subscription for ${err}`
                  );
                  await emailer.sendMail(
                    process.env.SUPP_EMAIL_ID,
                    `Re-embursement for user ${userEmail}`,
                    `Error while initiating a subscription for blockheader. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
                  );
                  return;
                }
              })
              .on("data", async blockHeader => {
                // new block header
                if (blockHeader.number != null) {
                  console.log(
                    `Received block with blocknumber: ${blockHeader.number}`
                  );
                  let currConfirmations = blockHeader.number - txBlockNumber;
                  if (currConfirmations >= ethConfirmation) {
                    // the limit is now met, complete the order
                    paymentLog.confirmations = currConfirmations;
                    paymentLog.status = "completed";
                    let respPendingNoti = await Notification.findOne({
                      eventId: newNotiId
                    });
                    if (respPendingNoti != null && !respPendingNoti.displayed) {
                      respPendingNoti.displayed = true;
                      await respPendingNoti.save();
                    }

                    let newNoti = newDefNoti();
                    newNoti.type = "success";
                    newNoti.email = userEmail;
                    newNoti.eventName = "payment is completed";
                    newNoti.eventId = uuidv4();
                    newNoti.title = "Payment Completed";
                    newNoti.message = `Your payment for course ${coursePrice.courseName} is now  completed!, checkout your <a href="/profile?inFocus=cryptoPayment">Profile</a>`;
                    newNoti.displayed = false;

                    user.examData.payment[paymentLog.course] = true;

                    let _payment = `XDCe:${paymentLog.payment_id}`;
                    _payment =
                      codeName == undefined ||
                      codeName == null ||
                      codeName == ""
                        ? _payment
                        : _payment + `;promocode:${codeName}`;
                    _payment =
                      refCode == null
                        ? _payment
                        : _payment + `;referralcode:${refCode}`;
                    user.examData.payment[
                      paymentLog.course + "_payment"
                    ] = _payment;

                    await paymentLog.save();
                    await user.save();
                    await newNoti.save();
                    blockSubscription.unsubscribe((err, success) => {
                      if (success) {
                        console.log(
                          `Finished listening for the tx ${txHash}; reason: successfully completed the order`
                        );
                        handleBurnToken(
                          course,
                          txHash,
                          paymentLog.payment_id,
                          userEmail,
                          XDCE
                        );
                      }
                    });
                  } else {
                    // check if more confirmations are received & update accordingly
                    if (
                      currConfirmations != parseInt(paymentLog.confirmations)
                    ) {
                      // have changed
                      paymentLog.confirmations = currConfirmations;
                      console.log(
                        `Updated the confirmations: ${paymentLog.confirmations}`
                      );
                      await paymentLog.save();
                    }
                  }
                }
              });
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
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${userEmail}`,
            `Some error has occured while listening for block headers. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
          );
        }
        break;
      }
      case 4: {
        break;
      }
      case 50: {
        const xdc3 = new XDC3(
          new XDC3.providers.HttpProvider(xinfinApothemRPC)
        );
        try {
          const txResponseReceipt = await axios.post(txReceiptUrlApothem, {
            tx: txHash,
            isTransfer: false
          });
          const txReceipt = txResponseReceipt.data;
          const coursePrice = await CoursePrice.findOne({ courseId: course });
          const xinConfirmation = coursePrice.xdcConfirmation;
          console.log(txReceipt);
          if (
            txReceipt.blockNumber == undefined ||
            txReceipt.blockNumber == null ||
            typeof txReceipt.blockNumber != "number"
          ) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason: no receipt found`
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `TxReceipt was null. Payment mode was via XDC. Payment transaction hash: ${txHash}`
            );
            return;
          }
          const paymentLog = await PaymentToken.findOne({ txn_hash: txHash });
          if (paymentLog == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason: no payment log found`
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `Payment log was null. Payment mode was via XDC. Payment transaction hash: ${txHash}`
            );
            return;
          }
          const user = await User.findOne({ email: userEmail });
          if (user == null) {
            // how ?
            console.log(
              `Finished listening for the tx ${txHash}; reason no user found`
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `User was null. Payment mode was via XDC. Payment transaction hash: ${txHash}`
            );
            return;
          }
          const txBlockNumber = txReceipt.blockNumber;
          if (paymentLog.status === "pending") {
            const ClearInterval = setInterval(async () => {
              // Proper State.
              let latestBlockNo = xdc3.eth.blockNumber;
              console.log(latestBlockNo);
              let currConfirmations = latestBlockNo - txBlockNumber;
              console.log(currConfirmations);
              if (currConfirmations >= xinConfirmation) {
                // the limit is now met, complete the order
                paymentLog.confirmations = currConfirmations;
                paymentLog.status = "completed";
                let respPendingNoti = await Notification.findOne({
                  eventId: newNotiId
                });
                if (respPendingNoti != null && !respPendingNoti.displayed) {
                  respPendingNoti.displayed = true;
                  await respPendingNoti.save();
                }
                let newNoti = newDefNoti();
                newNoti.type = "success";
                newNoti.email = userEmail;
                newNoti.eventName = "payment is completed";
                newNoti.eventId = uuidv4();
                newNoti.title = "Payment Completed";
                newNoti.message = `Your payment for course ${coursePrice.courseName} is now  completed!, checkout your <a href="/profile?inFocus=cryptoPayment">Profile</a>`;
                newNoti.displayed = false;

                user.examData.payment[paymentLog.course] = true;
                let _payment = `XDC:${paymentLog.payment_id}`;
                _payment =
                  codeName == undefined || codeName == null || codeName == ""
                    ? _payment
                    : _payment + `;promocode:${codeName}`;
                _payment =
                  refCode == null
                    ? _payment
                    : _payment + `;referralcode:${refCode}`;
                user.examData.payment[
                  paymentLog.course + "_payment"
                ] = _payment;

                await paymentLog.save();
                await user.save();
                await newNoti.save();
                handleBurnToken(
                  course,
                  txHash,
                  paymentLog.payment_id,
                  userEmail,
                  XDC
                );
                clearInterval(ClearInterval);
              } else {
                if (paymentLog.confirmations != currConfirmations) {
                  // update confirmations
                  paymentLog.confirmations = currConfirmations;
                  await paymentLog.save();
                }
              }
            }, 10000);
          } else {
            console.log(
              `Finished listening for the tx ${txHash}; reason: status mismatch -> ${paymentLog.status}`
            );
            clearInterval(ClearInterval);
            return;
          }
        } catch (e) {
          console.error(
            `Some error has occured while listening for tx: ${txHash}: `,
            e
          );
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${userEmail}`,
            `Some error has occured while listening for block headers. Payment mode was via XDC. Payment transaction hash: ${txHash}`
          );
          clearInterval(ClearInterval);
        }
        break;
      }
      // case 50: {
      //   break;
      // }
      default: {
        console.error(
          `No listener registered for the chain with networkid ${network}`
        );
      }
    }
  });
}

function listenForMined(
  txHash,
  network,
  userEmail,
  price,
  course,
  req,
  refCode
) {
  setImmediate(async () => {
    switch (network) {
      case 1: {
        try {
          const web3 = new Web3(
            new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
          );
          const contractInst = new web3.eth.Contract(xdceABI, xdceAddrMainnet);
          const coursePrice = await CoursePrice.findOne({ courseId: course });
          const blockdegreePubAddr = await getXDCeRecipient("1");
          if (blockdegreePubAddr === null) {
            console.error(
              "Error occured while fetching blockdegreePubAddr at txnConfirmation.listenForMined"
            );
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Potential re-imbursement for the user ${req.user.email}`,
              `Some error occured while fetching the blockdegreePubAddr at txnConfirmation.listenForMined. TxHash: ${txHash}`
            );
            return;
          }
          if (coursePrice == null) {
            // how ?
            console.error("Course not found: ", course);
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${req.user.email}`,
              `No course found. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
            );
            return;
          }

          const discObj = await promoCodeService.usePromoCode(req);
          if (discObj.error == null) {
            // all good, can avail promo-code discount
            price = parseFloat(price) - discObj.discAmt;
          } else {
            console.error(
              `Error while using promocode ${req.body.codeName}: `,
              discObj.error
            );

            if (discObj.error != "bad request") {
              console.log("fatal error, closing listener");
              await emailer.sendMail(
                process.env.SUPP_EMAIL_ID,
                `Re-embursement for user ${req.user.email}`,
                `Error while applying promo-code. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
              );
              return;
            }
          }

          const xdcePrice = await getXinEquivalent(price);
          const xdceTolerance = coursePrice.xdceTolerance;
          if (xdcePrice == -1) {
            // error while calculating current price.
            console.error("Error while fetching the current price");
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${req.user.email}`,
              `Error while fetching the current price. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
            );
            return;
          }
          console.log(
            `Started listening for the mining for mining of TX ${txHash} for user ${userEmail} on network ${network}`
          );
          let TxMinedListener = setInterval(async () => {
            console.log(
              `Interval for TxMined for tx ${txHash} at network ${network} for user ${userEmail}`
            );

            let txReceipt = await web3.eth.getTransactionReceipt(txHash);
            if (txReceipt != null) {
              // txnMined.
              console.log(`Got the tx receipt for the tx: ${txHash}`);

              const comPaymentToken = await PaymentToken.findOne({
                txn_hash: txReceipt.transactionHash
              });
              if (comPaymentToken == null) {
                // this transaction is already recorded
                console.log(
                  "Cannot find the token in paymentlogs for hash: ",
                  txReceipt.transactionHash
                );
                TxMinedListener = clearInterval(TxMinedListener);
                return;
              }
              let getTx = await web3.eth.getTransaction(txHash);
              let txInputData = getTx.input;
              // let expectedData = contractInst.methods
              //   .transfer(xdceOwnerPubAddr, xdcePrice)
              //   .encodeABI();
              let decodedMethod = abiDecoder.decodeMethod(txInputData);

              console.log(
                "Minimum Value: ",
                parseFloat(xdcePrice) -
                  parseFloat((xdcePrice * xdceTolerance) / 100)
              );
              console.log(
                "Maximum Value: ",
                parseFloat(xdcePrice) +
                  parseFloat((xdcePrice * xdceTolerance) / 100)
              );
              console.log(
                "Actual Value: ",
                parseFloat(decodedMethod.params[1].value)
              );

              let valAcceptable =
                parseFloat(xdcePrice) -
                  parseFloat((xdcePrice * xdceTolerance) / 100) <=
                  parseFloat(decodedMethod.params[1].value) &&
                parseFloat(decodedMethod.params[1].value) <=
                  parseFloat(xdcePrice) +
                    parseFloat((xdcePrice * xdceTolerance) / 100);

              if (!valAcceptable) {
                TxMinedListener = clearInterval(TxMinedListener);
                console.log(
                  `Invalid value in tx ${txHash} by the user ${userEmail} at network ${network}`
                );
                await emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  `Re-embursement for user ${req.user.email}`,
                  `Invalid amount sent by the user. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
                );
                return;
              }
              let expectedData = contractInst.methods
                .transfer(blockdegreePubAddr, decodedMethod.params[1].value)
                .encodeABI();
              let validFuncSig = expectedData === txInputData && valAcceptable;
              console.log(validFuncSig);
              console.log(abiDecoder.decodeMethod(txInputData));
              if (!validFuncSig) {
                // invalid transaction;
                TxMinedListener = clearInterval(TxMinedListener);
                console.log(
                  `Invalid tx signature for tx ${txHash} by the user ${userEmail} at network ${network}`
                );
                await emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  `Re-embursement for user ${req.user.email}`,
                  `Invalid tx signature. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
                );
                return;
              }
              const blockData = await web3.eth.getBlock(txReceipt.blockNumber);
              if (blockData != null) {
                const txTimestamp = blockData.timestamp;
                if (!(Date.now() - txTimestamp > 24 * 60 * 60 * 1000)) {
                  // tx timedout
                  TxMinedListener = clearInterval(TxMinedListener);
                  // res.json({ error: "tx timed out", status: false });
                  await emailer.sendMail(
                    process.env.SUPP_EMAIL_ID,
                    `Re-embursement for user ${req.user.email}`,
                    `Transaction timed-out. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
                  );
                  return;
                }
              }
              /* 
        1. check if the to is our address - done
        2. check if the value is within the tolerance of our system - done
        3. check if the blockdate is not older than 12 hrs - done
        4. check if thr transaction is already recorded
      */
              // let newPaymentXdce = newPaymentToken();
              // newPaymentXdce.payment_id = uuidv4();
              // newPaymentXdce.email = userEmail;
              // newPaymentXdce.creationDate = Date.now();
              // newPaymentXdce.txn_hash = txHash;
              // newPaymentXdce.course = course;
              // newPaymentXdce.tokenName = XDCE;
              // newPaymentXdce.price = price;
              // newPaymentXdce.status = "pending";
              // newPaymentXdce.autoBurn = coursePrice.autoBurn;
              comPaymentToken.status = "pending";
              comPaymentToken.tokenAmt = decodedMethod.params[1].value.toString();
              let newNoti = newDefNoti();
              // email: "",
              // eventName: "",
              // eventId: "",
              // type: "",
              // title: "",
              // message: "",
              // displayed: ""
              let newNotiId = uuidv4();
              newNoti.type = "info";
              newNoti.email = userEmail;
              newNoti.eventName = "payment in pending";
              newNoti.eventId = newNotiId;
              newNoti.title = "Payment Mined";
              newNoti.message = `Your payment for course ${coursePrice.courseName} has been mined!, checkout your <a href="/profile?inFocus=cryptoPayment">Profile</a>`;
              newNoti.displayed = false;

              try {
                await newNoti.save();
                await comPaymentToken.save();
              } catch (e) {
                console.error(
                  `Some error occured while saving the payment log: `,
                  e
                );
                await emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  `Re-embursement for user ${req.user.email}`,
                  `Error while saving the payment log. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
                );
                TxMinedListener = clearInterval(TxMinedListener);
                return;
              }
              clearInterval(TxMinedListener);
              console.log(
                `Finished listening for the tx ${txHash} for user ${userEmail}`
              );
              listenForConfirmation(
                txHash,
                1,
                userEmail,
                course,
                newNotiId,
                req.body.codeName,
                refCode
              );
              return;
            }
          }, 10000);
        } catch (e) {
          console.error(
            `Some error occured while listening for the mining of tx ${txHash} on network id ${network} for user ${userEmail}`
          );
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${req.user.email}`,
            `Some error occured while listening for the mining of tx. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
          );
          return;
        }

        break;
      }
      // case 50: {
      //   break;
      // }
      case 50: {
        try {
          const coursePrice = await CoursePrice.findOne({ courseId: course });
          if (coursePrice == null) {
            // how ?
            console.error("Course not found: ", course);
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `No course found. Payment mode was via XDC. Payment transaction hash: ${txHash}`
            );
            return;
          }
          console.log("Price: ", price);
          const discObj = await promoCodeService.usePromoCode(req);
          if (discObj.error == null) {
            // all good, can avail promo-code discount
            price = parseFloat(price) - discObj.discAmt;
          } else {
            console.error(
              `Error while using promocode ${req.body.codeName}: `,
              discObj.error
            );

            if (discObj.error != "bad request") {
              console.log("fatal error, closing listener");
              await emailer.sendMail(
                process.env.SUPP_EMAIL_ID,
                `Re-embursement for user ${userEmail}`,
                `Error while applying promo-code. Payment mode was via XDC. Payment transaction hash: ${txHash}`
              );
              return;
            }
          }

          const xdcPrice = await getXinEquivalent(price);
          const xdcTolerance = coursePrice.xdcTolerance;
          if (xdcPrice == -1) {
            // error while calculating current price.
            console.error("Error while fetching the current price");
            await emailer.sendMail(
              process.env.SUPP_EMAIL_ID,
              `Re-embursement for user ${userEmail}`,
              `Error while fetching the current price. Payment mode was via XDC. Payment transaction hash: ${txHash}`
            );
            return;
          }
          console.log(
            `Started listening for the mining for mining of TX ${txHash} for user ${userEmail} on network ${network}`
          );
          let TxMinedListener = setInterval(async () => {
            console.log(
              `Interval for TxMined for tx ${txHash} at network ${network} for user ${userEmail}`
            );

            let txResponseReceipt = await axios({
              method: "post",
              url: txReceiptUrlApothem,
              data: {
                tx: txHash,
                isTransfer: false
              }
            });
            console.log(txResponseReceipt);
            txReceipt = txResponseReceipt.data;
            console.log(txReceipt);
            if (
              txReceipt.blockNumber != undefined &&
              txReceipt.blockNumber != null &&
              typeof txReceipt.blockNumber == "number"
            ) {
              // txnMined.
              console.log(
                `Got the tx receipt for the tx: ${txHash} on XinFin Network`
              );
              let xdcTokenAmnt = parseFloat(txReceipt.value) * Math.pow(10, 18);
              let tknRecipient = txReceipt.to;
              console.log(txReceipt);
              let xdcOwnerPubAddr = await getXDCRecipient("50");
              if (xdcOwnerPubAddr == null) {
                console.error(
                  "Some error occured at payment.payViaXdc while fetching the XDC recipient: "
                );
                await emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  `Potential re-imbursement for the user ${req.user.email}`,
                  `Some error occured while fetching the xdceOwnerPubAddr at payments.payViaXdce. TxHash: ${txn_hash}`
                );
                clearInterval(TxMinedListener);
                return;
              }
              if (tknRecipient !== xdcOwnerPubAddr) {
                console.error("Invalid recipient for Payment By XDC");
                clearInterval(TxMinedListener);
                return;
              }

              console.log("Expected Price: ", xdcPrice);
              console.log("Actual Price: ", xdcTokenAmnt);

              console.log(
                "Minimum Value: ",
                parseFloat(xdcPrice) - parseFloat(xdcPrice * xdcTolerance) / 100
              );
              console.log(
                "Maximum Value: ",
                parseFloat(xdcPrice) + parseFloat(xdcPrice * xdcTolerance) / 100
              );
              console.log("Actual Value: ", parseFloat(xdcTokenAmnt));

              let valAcceptable =
                parseFloat(xdcPrice) -
                  parseFloat(xdcPrice * xdcTolerance) / 100 <=
                  parseFloat(xdcTokenAmnt) &&
                parseFloat(xdcTokenAmnt) <=
                  parseFloat(xdcPrice) +
                    parseFloat(xdcPrice * xdcTolerance) / 100;
              if (!valAcceptable) {
                TxMinedListener = clearInterval(TxMinedListener);
                console.log(
                  `Invalid value in tx ${txHash} by the user ${userEmail} at network XinFin`
                );
                await emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  `Re-embursement for user ${userEmail}`,
                  `User sent an invalid amount of token. Payment mode was via XDC. Payment transaction hash: ${txHash}`
                );
                clearInterval(TxMinedListener);
                return;
              }
              console.log(txReceipt.blockNumber);

              /* 
            1. check if the to is our address - done
            2. check if the value is within the tolerance of our system - done
            3. check if the blockdate is not older than 12 hrs - done
            4. check if the transaction is already recorded - done
          */

              let comPaymentToken = await PaymentToken.findOne({
                txn_hash: txReceipt.hash
              });
              if (comPaymentToken == null) {
                TxMinedListener = clearInterval(TxMinedListener);
                await emailer.sendMail(
                  process.env.SUPP_EMAIL_ID,
                  `Fatal error for user ${userEmail}`,
                  `Fatal error occured while finding the tokne for transaction hash: ${txReceipt.hash} for user ${userEmail}`
                );
                clearInterval(TxMinedListener);
                return;
              }

              comPaymentToken.status = "pending";
              comPaymentToken.tokenAmt = xdcTokenAmnt;
              await comPaymentToken.save();
              TxMinedListener = clearInterval(TxMinedListener);
              eventEmitter.emit(
                "listenTxConfirm",
                txHash,
                50,
                userEmail,
                course,
                req.body.codeName,
                refCode
              );
              return;
            }
          }, 10000);
        } catch (e) {
          console.error(
            `Some error occured while listening for the mining of tx ${txHash} on network id ${network} for user ${userEmail}`
          );
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Re-embursement for user ${userEmail}`,
            `Some error occured while listening for the mining of tx. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
          );
          clearInterval(TxMinedListener);
          return;
        }
        break;
      }
      default: {
        console.error(
          `No listener registered for the chain with networkid ${network}`
        );
      }
    }
  });
}

function newPaymentToken() {
  return new PaymentToken({
    payment_id: "",
    email: "",
    creationDate: "",
    txn_hash: "",
    course: "",
    tokenName: "",
    tokenAmt: "",
    price: "",
    status: "", // pending, complete or rejected
    confirmations: "0",
    autoBurn: false,
    burn_txn_hash: "",
    burn_token_amnt: ""
  });
}

function newDefBurnLog(id, txHash) {
  return new BurnLog({
    principal_payment_id: id,
    principal_userEmail: "",
    principal_txn_hash: txHash,
    course: "",
    tokenName: "",
    tokenAmt: "",
    principal_from: "",
    from: "",
    to: "",
    creationDate: "",
    burn_network: ""
  });
}

async function getXinEquivalent(amnt) {
  try {
    const currXinPrice = await axios.get(coinMarketCapAPI);
    console.log("Parameter amnt: ", amnt);
    console.log("Price usd: ", currXinPrice.data[0].price_usd);
    if (
      currXinPrice.data[0] != undefined ||
      currXinPrice.data[0] != undefined
    ) {
      console.log(
        (parseFloat(amnt) / parseFloat(currXinPrice.data[0].price_usd)) *
          Math.pow(10, 18)
      );
      return (
        (parseFloat(amnt) /
          (parseFloat(currXinPrice.data[0].price_usd) * divisor)) *
        Math.pow(10, 18)
      );
    }
  } catch (e) {
    console.error(
      "Some error occurred while making or processing call from CoinMarketCap"
    );
    return -1;
  }
}

async function handleBurnToken(
  courseId,
  txHash,
  paymentId,
  userEmail,
  tokenName
) {
  switch (tokenName) {
    case "xdce": {
      try {
        const web3 = new Web3(
          new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
        );

        let course = await CoursePrice.findOne({ courseId: courseId });
        let getTx = await web3.eth.getTransaction(txHash);
        let paymentLog = await PaymentToken.findOne({ payment_id: paymentId });
        let txInputData = getTx.input;
        let decodedMethod = abiDecoder.decodeMethod(txInputData);
        let receivedXdce = decodedMethod.params[1].value;

        const contractInst = new web3.eth.Contract(xdceABI, xdceAddrMainnet);

        const allWallet = await AllWallet.findOne({
          burnActive: {
            $elemMatch: {
              wallet_network: paymentLog.payment_network,
              wallet_token_name: tokenName
            }
          }
        });

        let xdceOwnerPubAddr = null;
        loop1: {
          for (let f = 0; f < allWallet.burnActive.length; f++) {
            if (
              allWallet.burnActive[f].wallet_network ==
                paymentLog.payment_network &&
              allWallet.burnActive[f].wallet_token_name == tokenName
            ) {
              // Eureka!
              xdceOwnerPubAddr = allWallet.burnActive[f].wallet_address;
              break loop1;
            }
          }
        }

        const blockdegreePubAddr = xdceOwnerPubAddr;

        if (xdceOwnerPubAddr == null) {
          console.error(
            "Some error occured while fethcing the XDCe recipient address txnConfirmation."
          );
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Potential for user ${userEmail}`,
            `XDCe recipient was null. Payment mode was via XDCe. Payment transaction hash: ${txHash}`
          );
          return;
        }

        let burnAmnt = "";

        if (!paymentLog.autoBurn) {
          console.log("Auto-Burn has been turned off, closed the listener.");
          return;
        }

        for (let z = 0; z < course.burnToken.length; z++) {
          if (
            course.burnToken[z].tokenName === XDCE &&
            course.burnToken[z].autoBurn
          ) {
            // token has applied for burning & autoBurn is on
            const burnPercent = parseFloat(course.burnToken[z].burnPercent);
            burnAmnt = Math.floor(
              (parseFloat(receivedXdce) * burnPercent) / 100
            ).toString();
            break;
          }
        }

        if (burnAmnt == 0 || burnAmnt == "0" || burnAmnt == "") {
          // dont burn
          console.log("Auto-Burn has been turned off, closed the listener.");
          return;
        }

        const encodedData = contractInst.methods
          .transfer(burnAddress, burnAmnt)
          .encodeABI();

        console.log(
          "Pending: ",
          await web3.eth.getTransactionCount(blockdegreePubAddr, "pending")
        );
        console.log(
          "Confirmed: ",
          await web3.eth.getTransactionCount(blockdegreePubAddr)
        );
        const tx = {
          from: blockdegreePubAddr,
          to: xdceAddrMainnet,
          gas: 60000,
          data: encodedData,
          nonce: await web3.eth.getTransactionCount(blockdegreePubAddr)
        };

        web3.eth.accounts
          .signTransaction(tx, keyConfig[xdceOwnerPubAddr].privateKey)
          .then(signedTx => {
            web3.eth
              .sendSignedTransaction(signedTx.rawTransaction)
              .on("receipt", async burnReceipt => {
                if (burnReceipt.status) {
                  // the transaction is accepted
                  paymentLog.burn_txn_hash = burnReceipt.transactionHash;
                  paymentLog.burn_token_amnt = burnAmnt;

                  let newBurnLog = newDefBurnLog(uuidv4(), txHash);
                  newBurnLog.principal_userEmail = userEmail;
                  newBurnLog.course = courseId;
                  newBurnLog.principal_from = getTx.from;
                  newBurnLog.tokenName = tokenName;
                  newBurnLog.tokenAmt = burnAmnt;
                  newBurnLog.creationDate = Date.now().toString();
                  newBurnLog.to = burnAddress;
                  newBurnLog.from = blockdegreePubAddr;
                  newBurnLog.burn_network = paymentLog.payment_network;
                  await newBurnLog.save();
                  await paymentLog.save();
                  console.log(
                    "Successfully burned token for payment by user: ",
                    userEmail
                  );
                } else {
                  console.error("Error while comfirming the tx");
                  return;
                }
              });
          });
      } catch (e) {
        console.log(e);
      }
      break;
    }
    case "xdc": {
      console.log("Called burning XDC");
      try {
        const web3 = new Web3(
          new Web3.providers.HttpProvider(xinfinApothemRPC)
        );

        let course = await CoursePrice.findOne({ courseId: courseId });
        let paymentLog = await PaymentToken.findOne({ payment_id: paymentId });
        let txReceiptResponse = await axios.post(txReceiptUrlApothem, {
          tx: txHash,
          isTransfer: false
        });
        let receivedXdc = txReceiptResponse.data.value;
        let burnAmnt = "";

        if (!paymentLog.autoBurn) {
          console.log("Auto-Burn has been turned off, closed the listener.");
          return;
        }
        let burnPercent;
        for (let z = 0; z < course.burnToken.length; z++) {
          if (course.burnToken[z].tokenName === XDC) {
            // token has applied for burning & autoBurn is on
            burnPercent = parseFloat(course.burnToken[z].burnPercent);
            console.log("Burn Percent: ", burnPercent);
            console.log("Received Amnt: ", receivedXdc);
            burnAmnt =
              ((parseFloat(receivedXdc) * burnPercent) / 100) *
              Math.pow(10, 18).toString();
            console.log("Burn Amount: ", burnAmnt);
            break;
          }
        }

        console.log(burnAmnt, burnPercent);

        if (burnAmnt == 0 || burnAmnt == "0" || burnAmnt == "") {
          // dont burn
          console.log("Auto-Burn has been turned off, closed the listener.");
          return;
        }

        const allWallet = await AllWallet.findOne({
          burnActive: {
            $elemMatch: {
              wallet_network: paymentLog.payment_network,
              wallet_token_name: tokenName
            }
          }
        });
        let blockdegreePubAddrXDCApothm = null;
        loop1: {
          for (let f = 0; f < allWallet.burnActive.length; f++) {
            if (
              allWallet.burnActive[f].wallet_network ==
                paymentLog.payment_network &&
              allWallet.burnActive[f].wallet_token_name == tokenName
            ) {
              // Eureka!
              blockdegreePubAddrXDCApothm =
                allWallet.burnActive[f].wallet_address;
              break loop1;
            }
          }
        }

        if (blockdegreePubAddrXDCApothm == null) {
          console.error(
            "Some error occured while fethcing the XDC recipient address txnConfirmation."
          );
          await emailer.sendMail(
            process.env.SUPP_EMAIL_ID,
            `Potential for user ${userEmail}`,
            `XDC recipient was null. Payment mode was via XDC. Payment transaction hash: ${txHash}`
          );
          return;
        }

        blockdegreePubAddrXDCApothm =
          "0x" + blockdegreePubAddrXDCApothm.slice(3);

        console.log(
          "Pending: ",
          await web3.eth.getTransactionCount(
            blockdegreePubAddrXDCApothm,
            "pending"
          )
        );
        console.log(
          "Confirmed: ",
          await web3.eth.getTransactionCount(blockdegreePubAddrXDCApothm)
        );
        const rawTx = {
          from: blockdegreePubAddrXDCApothm,
          to: "0x0000000000000000000000000000000000000000",
          gas: 21000,
          gasPrice: 9000,
          value: burnAmnt,
          nonce: await web3.eth.getTransactionCount(blockdegreePubAddrXDCApothm)
        };

        const privKey = Buffer.from(
          keyConfig[blockdegreePubAddrXDCApothm].privateKey,
          "hex"
        );
        const tx = new EthereumTx(rawTx);
        tx.sign(privKey);
        let serializedTx = tx.serialize();
        web3.eth.sendSignedTransaction(
          "0x" + serializedTx.toString("hex"),
          async function(err, hash) {
            if (!err) {
              console.log("Burned XDC; txHash: ", hash);

              paymentLog.burn_txn_hash = hash;
              paymentLog.burn_token_amnt = burnAmnt;

              let principalFrom = txReceiptResponse.data.from;

              let newBurnLog = newDefBurnLog(uuidv4(), txHash);
              newBurnLog.principal_userEmail = userEmail;
              newBurnLog.course = courseId;
              newBurnLog.principal_from = principalFrom;
              newBurnLog.tokenName = tokenName;
              newBurnLog.tokenAmt = burnAmnt;
              newBurnLog.creationDate = Date.now().toString();
              newBurnLog.to = burnAddress;
              newBurnLog.from = "xdc" + blockdegreePubAddrXDCApothm.slice(2);
              newBurnLog.burn_network = paymentLog.payment_network;
              await newBurnLog.save();
              await paymentLog.save();
              console.log(
                "Successfully burned token for payment by user: ",
                userEmail
              );
            } else console.error(err);
          }
        );
      } catch (e) {
        console.error(e);
      }
      break;
    }
  }
}

function newDefNoti() {
  return new Notification({
    email: "",
    eventName: "",
    eventId: "",
    type: "",
    title: "",
    message: "",
    displayed: false
  });
}

async function getXDCeRecipient(network) {
  const configWallet = await AllWallet.findOne();
  if (configWallet == null) {
    console.log("Wallet not configured");
    return null;
  }
  for (let i = 0; i < configWallet.recipientWallets.length; i++) {
    if (
      configWallet.recipientActive[i].wallet_token_name === "xdce" &&
      configWallet.recipientActive[i].wallet_network === network
    ) {
      return configWallet.recipientActive[i].wallet_address;
    }
  }
  return null;
}

async function getXDCRecipient(network) {
  const configWallet = await AllWallet.findOne();
  if (configWallet == null) {
    console.log("Wallet not configured");
    return null;
  }
  for (let i = 0; i < configWallet.recipientWallets.length; i++) {
    if (
      configWallet.recipientActive[i].wallet_token_name === "xdc" &&
      configWallet.recipientActive[i].wallet_network === network
    ) {
      return configWallet.recipientActive[i].wallet_address;
    }
  }
}

eventEmitter.on("listenTxConfirm", listenForConfirmation);
eventEmitter.on("listenTxMined", listenForMined);

exports.em = eventEmitter;
