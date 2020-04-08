//  burn token event for paypal burn
let EventEmitter = require("events").EventEmitter;
const PaymentLog = require("../models/payment_logs");
const emailer = require("../emailer/impl");
const Notification = require("../models/notifications");
const keyConfig = require("../config/keyConfig");
const Web3 = require("web3");
let eventEmitter = new EventEmitter();
const axios = require("axios");
const CoursePrice = require("../models/coursePrice");
const uuid = require("uuid/v4");
const cmcHelper = require("../helpers/cmcHelper");
const WsServer = require("../listeners/donationListener").em;

const networks = {
  "51": "http://rpc.apothem.network",
  "50": "http://rpc.xinfin.network",
  "1": "wss://mainnet.infura.io/ws"
};

const courseName = {
  course_1: "Basic",
  course_2: "Advanced",
  course_3: "Professional"
};

const coinMarketCapAPI =
  "https://api.coinmarketcap.com/v1/ticker/xinfin-network/";

const burnAddress = "0x0000000000000000000000000000000000000000";

const divisor = 1; // for testing purposes 1 million'th of actual value will be used

async function paypalBurnToken(paymentId, amount, chainId, courseId, email) {
  try {
    console.log(
      `[*] called event paypalBurnToken for payment: ${paymentId} to burn on chainId ${chainId}`
    );
    let currWallet = {};
    Object.keys(keyConfig).forEach(key => {
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
      web3
    );
    console.log("[*] Signed ", signed);
    web3.eth
      .sendSignedTransaction(signed.rawTransaction)
      .then(async receipt => {
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
        newNoti.message = `We have burned some tokens for your payment of the course ${courseName[courseId]} is now  completed!, checkout your <a href="/profile?inFocus=paypalPayment">Profile</a>`;
        await newNoti.save();
        await paymentLog.save();
        WsServer.emit("new-noti", email);
      })
      .catch(e => {
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

eventEmitter.on("burnTokenPaypal", paypalBurnToken);

async function makePayment(encodedData, toAddr, privKey, chainId, value, web3) {
  console.log("[*] called makePayment function");
  console.log(encodedData, toAddr, privKey, chainId, value);
  // const estimateGas = await web3.eth.estimateGas({ data: encodedData }); //  this throws an error 'tx will always fail or gas will exceed allowance'
  const account = web3.eth.accounts.privateKeyToAccount(privKey);
  console.log("Account: ", account);
  const rawTx = {
    to: toAddr,
    from: account.address,
    gas: 1000000,
    gasPrice: await web3.eth.getGasPrice(),
    nonce: await web3.eth.getTransactionCount(account.address),
    data: encodedData,
    chainId: chainId + "",
    value: value
  };
  const signed = await web3.eth.accounts.signTransaction(rawTx, privKey);
  return signed;
}

async function getXinEquivalent(amnt) {
  try {
    const cmcData = await cmcHelper.getXdcPrice();
    const cmcPrice = cmcData.data.data["2634"].quote.USD;
    if (cmcData !== null) {
      console.log((parseFloat(amnt) / parseFloat(cmcPrice)) * Math.pow(10, 18));
      return (
        (parseFloat(amnt) / (parseFloat(cmcPrice) * divisor)) * Math.pow(10, 18)
      );
    }
  } catch (e) {
    console.error(
      "Some error occurred while making or processing call from CoinMarketCap"
    );
    console.log(e);
    return -1;
  }
}

function newDefNoti() {
  return new Notification({
    email: "",
    eventName: "burn completed",
    eventId: uuid(),
    type: "",
    title: "",
    message: ``,
    displayed: false
  });
}

exports.em = eventEmitter;
