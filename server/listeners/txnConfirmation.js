let EventEmitter = require("events").EventEmitter;
const PaymentToken = require("../models/payment_token");
const CoursePrice = require("../models/coursePrice");
const BurnLog = require("../models/burn_logs");
const User = require("../models/user");
const Web3 = require("web3");
const contractConfig = require("../config/smartContractConfig");
const keyConfig = require("../config/keyConfig").mainnetPrivateKey;
const uuidv4 = require("uuid/v4");
const abiDecoder = require("abi-decoder");
const axios = require("axios");

let eventEmitter = new EventEmitter();
// const ethConfirmation = 3;
// const xinConfirmation = 3;
const contractAddrRinkeby = contractConfig.address.rinkeby;
const contractABI = contractConfig.ABI;
const xdceAddrMainnet = contractConfig.address.xdceMainnet;
const xdceABI = contractConfig.XdceABI;

const xdceOwnerPubAddr = "0x4f72d2cd0f4152f4185b2013fb45Cc3A9B89d99E";
const blockdegreePubAddr = "0x3C7a500D32C3A8317c943293c2a123A0456aa2D0";
const burnAddress = "0x0000000000000000000000000000000000000000";
const coinMarketCapAPI =
  "https://api.coinmarketcap.com/v1/ticker/xinfin-network/";
// const xdcePrice = 10;
const xdcPrice = 10;
const XDCE = "xdce";

// const xdceTolerance = 10; // tolerance set to 5 percent of principal value.

const divisor = 1000000; // for testing purposes 1 million'th of actual value will be used

abiDecoder.addABI(xdceABI);

function listenForConfirmation(txHash, network, userEmail, course) {
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
            let blockSubscription = web3.eth
              .subscribe("newBlockHeaders", (err, result) => {
                if (err) {
                  console.error(
                    `Some error has occured while starting the subscription for ${err}`
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
                    user.examData.payment[paymentLog.course] = true;
                    await paymentLog.save();
                    await user.save();
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
        }
        break;
      }
      case 4: {
        break;
      }
      case 50: {
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

function listenForMined(txHash, network, userEmail, price, course) {
  setImmediate(async () => {
    switch (network) {
      case 1: {
        try {
          const web3 = new Web3(
            new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
          );
          const contractInst = new web3.eth.Contract(xdceABI, xdceAddrMainnet);
          const coursePrice = await CoursePrice.findOne({ courseId: course });
          if (coursePrice == null) {
            // how ?
            console.error("Course not found: ", course);
            return;
          }
          const xdcePrice = await getXinEquivalent(coursePrice.priceUsd);
          const xdceTolerance = coursePrice.xdceTolerance;
          if (xdcePrice == -1) {
            // error while calculating current price.
            console.error("Error while fetching the current price");
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

              const duplicateTx = await PaymentToken.findOne({
                txn_hash: txReceipt.transactionHash
              });
              if (duplicateTx != null) {
                // this transaction is already recorded
                console.log(
                  `User ${userEmail} tried to double spend hash: ${txReceipt.transactionHash}`
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
              let valAcceptable =
                parseFloat(xdcePrice) -
                  parseFloat(xdcePrice * xdceTolerance) / 100 <=
                  parseFloat(decodedMethod.params[1].value) &&
                parseFloat(decodedMethod.params[1].value) <=
                  parseFloat(xdcePrice) +
                    parseFloat(xdcePrice * xdceTolerance) / 100;
              if (!valAcceptable) {
                TxMinedListener = clearInterval(TxMinedListener);
                console.log(
                  `Invalid value in tx ${txHash} by the user ${userEmail} at network ${network}`
                );
                return;
              }
              let expectedData = contractInst.methods
                .transfer(
                  xdceOwnerPubAddr,
                  parseInt(decodedMethod.params[1].value)
                )
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
                return;
              }
              const blockData = await web3.eth.getBlock(txReceipt.blockNumber);
              if (blockData != null) {
                const txTimestamp = blockData.timestamp;
                if (!(Date.now() - txTimestamp > 24 * 60 * 60 * 1000)) {
                  // tx timedout
                  TxMinedListener = clearInterval(TxMinedListener);
                  res.json({ error: "tx timed out", status: false });
                  return;
                }
              }
              /* 
        1. check if the to is our address - done
        2. check if the value is within the tolerance of our system - done
        3. check if the blockdate is not older than 12 hrs - done
        4. check if thr transaction is already recorded
      */
              let newPaymentXdce = newPaymentToken();
              newPaymentXdce.payment_id = uuidv4();
              newPaymentXdce.email = userEmail;
              newPaymentXdce.creationDate = Date.now();
              newPaymentXdce.txn_hash = txHash;
              newPaymentXdce.course = course;
              newPaymentXdce.tokenName = XDCE;
              newPaymentXdce.price = price;
              newPaymentXdce.status = "pending";
              try {
                await newPaymentXdce.save();
              } catch (e) {
                console.error(
                  `Some error occured while saving the payment log: `,
                  e
                );
                TxMinedListener = clearInterval(TxMinedListener);
                return;
              }
              clearInterval(TxMinedListener);
              console.log(
                `Finished listening for the tx ${txHash} for user ${userEmail}`
              );
              listenForConfirmation(txHash, 1, userEmail, course);
              return;
            }
          }, 10000);
        } catch (e) {
          console.error(
            `Some error occured while listening for the mining of tx ${txHash} on network id ${network} for user ${userEmail}`
          );
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
    confirmations: "0"
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
    creationDate: ""
  });
}

async function getXinEquivalent(amnt) {
  try {
    const currXinPrice = await axios.get(coinMarketCapAPI);
    if (
      currXinPrice.data[0] != undefined ||
      currXinPrice.data[0] != undefined
    ) {
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
        let burnAmnt = 0;

        for (let z = 0; z < course.burnToken.length; z++) {
          if (
            course.burnToken[z].tokenName === XDCE &&
            course.burnToken[z].autoBurn
          ) {
            // token has applied for burning & autoBurn is on
            const burnPercent = parseFloat(course.burnToken[z].burnPercent);
            burnAmnt = Math.floor(
              (parseFloat(receivedXdce) * burnPercent) / 100
            );
            break;
          }
        }
        if (burnAmnt == 0) {
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
          gas: 2000000,
          data: encodedData,
          nonce: await web3.eth.getTransactionCount(
            blockdegreePubAddr,
            "pending"
          )
        };

        web3.eth.accounts.signTransaction(tx, keyConfig).then(signedTx => {
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
  }
}

eventEmitter.on("listenTxConfirm", listenForConfirmation);
eventEmitter.on("listenTxMined", listenForMined);

exports.em = eventEmitter;
