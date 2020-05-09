//  burn token event for paypal burn
let EventEmitter = require("events").EventEmitter;
const PaymentLog = require("../models/payment_logs");
const emailer = require("../emailer/impl");
const Notification = require("../models/notifications");
const keyConfig = require("../config/keyConfig");
const Web3 = require("web3");
const cmcHelper = require("../helpers/cmcHelper");
let eventEmitter = new EventEmitter();
const axios = require("axios");
const CoursePrice = require("../models/coursePrice");
const { removeExpo } = require("../helpers/common");
const UserFundRequest = require("../models/userFundRequest");
const uuid = require("uuid/v4");
// const WsServer = require("../listeners/donationListener").em;
let xdc3 = require("../helpers/blockchainConnectors").xdcInst;
const xdcWs = require("../helpers/constant").WsXinfinMainnet;
let Xdc3 = require("xdc3");

let inReconnXDC = false;

const networks = {
  "51": "https://rpc.apothem.network",
  "50": "https://rpc.xinfin.network",
  "1": "wss://mainnet.infura.io/ws/v3/e2ff4d049ebd4a4481bfeb6bc0857b47",
};

const courseName = {
  course_1: "Basic",
  course_2: "Advanced",
  course_3: "Professional",
};

const coinMarketCapAPI =
  "https://api.coinmarketcap.com/v1/ticker/xinfin-network/";

const burnAddress = "0x0000000000000000000000000000000000000000";

// const divisor = 1; // for testing purposes 1 million'th of actual value will be used

async function paypalBurnToken(
  paymentId,
  amount,
  chainId,
  courseId,
  email,
  optionalNonce
) {
  try {
    console.log(
      `[*] called event paypalBurnToken for payment: ${paymentId} to burn on chainId ${chainId}`
    );
    let currWallet = {};
    Object.keys(keyConfig).forEach((key) => {
      let wallet = keyConfig[key];
      if (wallet.wallet_network == chainId) {
        // found the appropriate wallet
        currWallet = wallet;
      }
    });
    if (currWallet == {}) {
      console.error("[*] wallet not found...");
      return;
    }
    const currNetwork = networks[chainId + ""];
    if (currNetwork.startsWith("wss")) {
      // is a websockect provider
      web3 = new Web3(new Web3.providers.WebsocketProvider(currNetwork));
    } else if (currNetwork.startsWith("http")) {
      // is http provider
      web3 = new Web3(new Web3.providers.HttpProvider(currNetwork));
    } else {
      console.error("[*] unknown network provider type");
      return;
    }
    const paymentLog = await PaymentLog.findOne({ payment_id: paymentId });
    if (paymentLog == null) {
      console.error("[*] payment log not found");
      return;
    }
    const amnt_usd = amount;
    const amnt_xdc = await getXinEquivalent(amnt_usd);
    if (amnt_xdc == -1) {
      console.error("[*] error occured while fetching the CMC data");
      paymentLog.burnStatus = "awaiting balance";
      paymentLog.burnTokenName = currWallet.wallet_token_name;
      await paymentLog.save();
      return;
    }
    const coursePrice = await CoursePrice.findOne({ courseId: courseId });
    if (coursePrice == null) {
      console.error(`[*] course not found, ${courseId}`);
      return;
    }

    let toAutoBurn = false;
    let burnPercent = 0;
    for (let g = 0; g < coursePrice.burnToken.length; g++) {
      if (coursePrice.burnToken[g].tokenName === currWallet.wallet_token_name) {
        toAutoBurn = coursePrice.burnToken[g].autoBurn;
        burnPercent = coursePrice.burnToken[g].burnPercent;
      }
    }

    if (!toAutoBurn) {
      console.error(`[*] auto-burn turned off`);
      return;
    }
    console.log(`[*] Burn Percent: ${burnPercent}`);
    const burn_amnt = Math.round((burnPercent * amnt_xdc) / 100);
    if (burn_amnt <= 0) {
      console.log(`[*] burn-amount is zero, quiting`);
      return;
    }

    console.log(
      `[*] Amount to be burned ${burn_amnt} for the payment of ${amnt_usd}`
    );
    let currPrivKey = currWallet.privateKey;
    if (!currPrivKey.startsWith("0x")) {
      currPrivKey = "0x" + currPrivKey;
    }
    const account = web3.eth.accounts.privateKeyToAccount(currPrivKey);
    console.log("current wallet: ", currWallet);
    console.log("current account: ", account);
    console.log("current network: ", currNetwork);
    const accountBalance = await web3.eth.getBalance(account.address);
    console.log(`[*] Current burn balance: `, accountBalance);
    if (
      accountBalance < 3000000000000000000000 &&
      accountBalance >= burn_amnt
    ) {
      emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        `Burn Token Threshhold Reached`,
        `Please top-up the account ${account.address} with XDC tokens as the balance is less than 3000 XDC.`
      );
    } else if (accountBalance < burn_amnt) {
      console.error("[*] insufficient balance");
      // push the burning to pending
      paymentLog.burnStatus = "awaiting balance";
      paymentLog.burnTokenName = currWallet.wallet_token_name;
      await paymentLog.save();
      await emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        `Insufficient tokens XDC Wallet`,
        `Could not burn the tokens for paypal payment ID: ${paymentId}, USER: ${email} due to insufficient XDC tokens. Please deposit some XDC tokens into ${account.address} ASAP & force burn via ADMIN page.`
      );
      return;
    }

    console.log(`[*] sufficient balance exists, continuing`);

    const signed = await makePayment(
      "",
      burnAddress,
      currPrivKey,
      chainId,
      burn_amnt,
      web3,
      optionalNonce
    );
    console.log("[*] Signed ", signed);
    web3.eth
      .sendSignedTransaction(signed.rawTransaction)
      .then(async (receipt) => {
        console.log("receipt received at paypalBurnToken");
        console.log(receipt);
        paymentLog.burnTx = receipt.transactionHash;
        paymentLog.burnAmnt = burn_amnt;
        paymentLog.burnStatus = "completed";
        paymentLog.burnTokenName = currWallet.wallet_token_name;
        let newNoti = newDefNoti();
        newNoti.email = email;
        newNoti.type = "info";
        newNoti.title = "Token Burned For Payment!";
        newNoti.message = `We have burned some tokens for your payment of the course ${courseName[courseId]} is now  completed! checkout your <a href="/profile?inFocus=paypalPayment">Profile</a>`;
        await newNoti.save();
        await paymentLog.save();
        // WsServer.emit("new-noti", email);
      })
      .catch((e) => {
        console.error("exception at paypalBurnToken");
        console.log(e);
      });
  } catch (err) {
    console.error(
      `Error while executing burnToken at listeners.burnToken: `,
      err
    );
    return;
  }
}
//! This function approximately burns token
/**
 *
 * @param {string} fundId fundId of the the funding request
 */
async function donationTokenBurn(fundId, optionalNonce) {
  try {
    console.log(`[*] burning token fund request for id: ${fundId}`);
    const currFundReq = await UserFundRequest.findOne({ fundId: fundId });
    if (currFundReq === null) {
      console.log(`fund with id ${fundId} not found`);
      return;
    }
    const coursePrice = await CoursePrice.findOne({
      courseId: currFundReq.courseId[0],
    });

    let totalAmount = parseFloat(currFundReq.amountGoal);

    const amntXdc = await getXinEquivalent(totalAmount);
    const burnPercent = parseFloat(coursePrice.burnToken[0].burnPercent);
    const burnAmnt = (amntXdc * burnPercent) / 100;
    let currWallet = {},
      currWalletAddr = "";
    // Object.keys(keyConfig).forEach((key) => {
    //   let wallet = keyConfig[key];
    //   if (wallet.wallet_network == "50") {
    //     // found the appropriate wallet
    //     currWallet = wallet;
    //     currWalletAddr = key;
    //     if (currWalletAddr.startsWith("0x")) {
    //       currWalletAddr = "xdc" + currWalletAddr.slice(2);
    //     }
    //   }
    // });
    const keyConfigKeys = Object.keys(keyConfig);
    for (let j = 0; j < keyConfigKeys.length; j++) {
      let key = keyConfigKeys[j];
      let wallet = keyConfig[key];
      if (wallet.wallet_network == "50") {
        // found the appropriate wallet
        currWallet = wallet;
        currWalletAddr = key;
        if (currWalletAddr.startsWith("0x")) {
          currWalletAddr = "xdc" + currWalletAddr.slice(2);
        }
        console.log(`KEY: ${key}, currWalletAddr: ${currWalletAddr}`);        
        break;
      }
    }
    console.log("current wallet address: ", currWalletAddr);

    const walletBalance = await xdc3.eth.getBalance(currWalletAddr);
    if (parseFloat(walletBalance < burnAmnt)) {
      console.log(`[*] insufficient balance to burn token`);
      await emailer.sendMailInternal(
        "blockdegree-bot@blockdegree.org",
        process.env.SUPP_EMAIL_ID,
        `Insufficient tokens XDC Wallet`,
        `Could not burn the tokens for fund ID: ${fundId} due to insufficient XDC tokens. Please deposit some XDC tokens into XDC burn address ASAP & force burn via ADMIN page.`
      );
      return;
    }
    let currPrivKey = currWallet.privateKey;
    if (!currPrivKey.startsWith("0x")) {
      currPrivKey = "0x" + currPrivKey;
    }
    const signed = await makePayment(
      "",
      burnAddress,
      currPrivKey,
      "50",
      burnAmnt,
      xdc3,
      optionalNonce
    );

    xdc3.eth
      .sendSignedTransaction(signed.rawTransaction)
      .then(async (receipt) => {
        console.log(`got the burning receipt for fund request: `, fundId);
        if (receipt.status == true) {
          currFundReq.burnTx = receipt.transactionHash;
          currFundReq.burnStatus = "completed";
          currFundReq.burnAmnt = burnAmnt;
          await currFundReq.save();
          genBurnNotiFMD(currFundReq.email, "recipient");
          if (
            currFundReq.donerEmail !== "" &&
            currFundReq.donerEmail !== undefined &&
            currFundReq.donerEmail !== null
          ) {
            genBurnNotiFMD(currFundReq.donerEmail, "funder");
          }
        }
      })
      .catch((e) => {});
    if (currWallet == {}) {
      console.error("[*] wallet not found...");
      return;
    }
  } catch (e) {
    console.log(`[*] exception at ${__filename}.donationTokenBurn: `, e);
  }
}

eventEmitter.on("burnTokenPaypal", paypalBurnToken);
eventEmitter.on("donationTokenBurn", donationTokenBurn);

async function makePayment(
  encodedData,
  toAddr,
  privKey,
  chainId,
  value,
  web3,
  optionalNonce
) {
  console.log("[*] called makePayment function");
  console.log(encodedData, toAddr, chainId, value);
  // const estimateGas = await web3.eth.estimateGas({ data: encodedData }); //  this throws an error 'tx will always fail or gas will exceed allowance'
  const account = web3.eth.accounts.privateKeyToAccount(privKey);
  let currNonce = await web3.eth.getTransactionCount(account.address);
  if (
    optionalNonce !== null &&
    optionalNonce !== undefined &&
    optionalNonce !== ""
  ) {
    currNonce = parseInt(currNonce) + parseInt(optionalNonce);
  }
  const gasPrice = await web3.eth.getGasPrice();

  const rawTx = {
    to: toAddr,
    from: account.address,
    gasPrice: gasPrice,
    gas: 1000000,
    nonce: currNonce,
    data: encodedData,
    chainId: chainId + "",
    value: removeExpo(Math.round(parseFloat(value))),
  };
  console.log("rawTX: ", rawTx);

  const signed = await web3.eth.accounts.signTransaction(rawTx, privKey);
  return signed;
}

async function getXinEquivalent(amnt) {
  try {
    const cmcPrice = await cmcHelper.getXdcPrice();
    if (cmcPrice !== null) {
      console.log((parseFloat(amnt) / parseFloat(cmcPrice)) * Math.pow(10, 18));
      return (parseFloat(amnt) / parseFloat(cmcPrice)) * Math.pow(10, 18);
    }
  } catch (e) {
    console.error(
      "Some error occurred while making or processing call from CoinMarketCap"
    );
    console.log(e);
    return -1;
  }
}

async function genBurnNotiFMD(email, type) {
  let newNoti = newDefNoti();
  newNoti.email = email;
  newNoti.type = "info";
  newNoti.title = "Token Burned For Payment!";
  newNoti.message = `We have burned some tokens for your Fund My Degree! checkout your <a href="/profile#${
    type === "funder" ? "fmd-funded" : "fmd-requests"
  }">Profile</a>`;
  await newNoti.save();
}

function newDefNoti() {
  return new Notification({
    email: "",
    eventName: "burn completed",
    eventId: uuid(),
    type: "",
    title: "",
    message: ``,
    displayed: false,
  });
}

exports.em = eventEmitter;

function connectionHeartbeat() {
  setInterval(async () => {
    try {
      const isActiveXdc = await xdc3.eth.net.isListening();
      console.log(`connection status XDC donationListener:${isActiveXdc}`);
      if (!isActiveXdc && inReconnXDC === false) xdcReconn();
    } catch (e) {
      if (inReconnXDC === false) xdcReconn();
    }
  }, 5000);
}

function xdcReconn() {
  try {
    console.log("[*] reconn xdc running");
    inReconnXDC = true;
    let currInterval = setInterval(() => {
      let xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
      xdc3 = new Xdc3(xdcProvider);
      xdcProvider.on("connect", () => {
        console.log(`[*] xdc reconnected to ws at ${__filename}`);
        clearInterval(currInterval);
        inReconnXDC = false;
      });
    }, 5000);
  } catch (e) {
    console.log(`exception at ${__filename}.xdcReconn: `, e);
  }
}

connectionHeartbeat();
