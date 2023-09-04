const Web3 = require("web3");
const Xdc3 = require("xdc3");
const EthereumTx = require("ethereumjs-tx");
const keythereum = require("keythereum");
const User = require("../models/user");
let xdcInst = require("./blockchainConnectors").xdcInst;
const { WsXinfinMainnet } = require("../helpers/constant");
const { removeExpo } = require("./common");

require("dotenv").config();

const tempABI = require("./tempABI");

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URI)
);
const contract = new web3.eth.Contract(tempABI, process.env.CONTRACT_ADDR);
const coinbase_acnt = process.env.DEF_ACCOUNT;

exports.addToSC = async (examData, email) => {
  console.log("Inside Add to SC");
  const user = await User.findOne({ email: email });
  let currPubKey;
  if (user.pubKey == "" || user.pubKey == undefined) {
    // user's account is not created create on.
    currPubKey = createKeystore(user.email);
  } else {
    currPubKey = user.pubKey;
  }
  console.log(`Current public Key: ${currPubKey}`);
  console.log(`User Key: ${user.pubKey}`);
  const keyObj = keythereum.importFromFile(
    coinbase_acnt,
    process.env.DEF_KEY_PATH
  );
  const privateKey = keythereum.recover(process.env.DEF_ACCOUNT_PWD, keyObj);
  const count = await web3.eth
    .getTransactionCount(coinbase_acnt)
    .catch((err) => {
      console.error(err);
      throw err;
    });
  var rawTransaction = {
    from: coinbase_acnt,
    gasPrice: web3.utils.toHex(20 * 1e9),
    gasLimit: web3.utils.toHex(210000),
    to: process.env.CONTRACT_ADDR,
    value: "0x0",
    data: contract.methods
      .addCertificate(
        currPubKey,
        examData.courseName,
        examData.userName,
        examData.timestamp,
        examData.marksObtained,
        examData.totalQuestions,
        examData.headlessHash,
        examData.clientHash
      )
      .encodeABI(),
    nonce: web3.utils.toHex(count),
    chainId: process.env.BLOCKCHAIN_CHAINID,
  };

  var transaction = new EthereumTx(rawTransaction);

  transaction.sign(privateKey);
  web3.eth
    .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
    .on("transactionHash", console.log)
    .catch((err) => {
      throw err;
    });
  return;
};

async function createKeystore(emailId) {
  const user = await User.findOne({ email: emailId }).catch((err) => {
    console.error(err);
    throw err;
  });
  if (!user) {
    console.error("no user associated with this account!");
    return null;
  }
  const dk = keythereum.create();
  const keyObj = keythereum.dump(
    process.env.KEYSTORE_PWD,
    dk.privateKey,
    dk.salt,
    dk.iv
  );
  keythereum.exportToFile(keyObj, "./server/keystore");
  const pubKey = web3.eth.accounts.privateKeyToAccount(dk.privateKey).address;
  user.pubKey = pubKey;
  await user.save();
  return pubKey;
}

/**
 * will perform basic transfer of tokens
 * @param {String} to valid to address xdc
 * @param {String} value value to send in WEI
 * @param {String} privateKey valid private key
 */
exports.makeValueTransferXDC = (to, value, privateKey) => {
  return new Promise((resolve, reject) => {
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + privateKey;
    }
    const account = xdcInst.eth.accounts.privateKeyToAccount(privateKey);
    xdcInst.eth
      .getTransactionCount(account.address)
      .then((count) => {
        xdcInst.eth.getGasPrice().then((gasPrice) => {
          const tx = {
            from: account.address,
            to: to,
            value: removeExpo(Math.round(value + "").toString()),
            nonce: count + "",
            gasPrice: gasPrice,
            chainId: "50",
          };
          xdcInst.eth.estimateGas(tx).then((gasLimit) => {
            tx["gas"] = gasLimit;
            xdcInst.eth.accounts
              .signTransaction(tx, privateKey)
              .then((signed) => {
                xdcInst.eth
                  .sendSignedTransaction(signed.rawTransaction)
                  .then((receipt) => {
                    resolve(receipt);
                  });
              });
          });
        });
      })
      .catch((e) => reject(e));
  });
};

exports.getBalance = (address) => {
  return new Promise((resolve, reject) => {
    if (address.startsWith("0x")) {
      address = "xdc" + address.split(2);
    }
    xdcInst.eth
      .getBalance(address)
      .then((bal) => {
        resolve(bal);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

/**
 * will return the TS in millsec of tx completion
 * @param {String} txHash transaction hash whose timestamp we need
 * @returns {Number}
 */
exports.getTransactionTimestamp = (txHash) => {
  return new Promise((resolve, reject) => {
    xdcInst.eth
      .getTransaction(txHash)
      .then((tx) => {
        const { blockNumber } = tx;
        xdcInst.eth
          .getBlock(blockNumber)
          .then(({ timestamp }) => {
            resolve(Number(timestamp) * 1000);
          })
          .catch((e) => reject(e));
      })
      .catch((e) => {
        reject(e);
      });
  });
};

exports.getUserData = () => {};

exports.getAttemptByHash = async (hash) => {};

//------------------------------- HEARTBEAT LOGIC----------------------------------
let inReconnXDC=false;

function connectionHeartbeat() {
  setInterval(async () => {
    try {
      const isActiveXdc = await xdcInst.eth.net.isListening();
      if (process.env.enableBlockchainSync === 'true') {
        console.log(`connection status XDC blockchain helper: ${isActiveXdc}`);
      }
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
      let xdcProvider = new Xdc3.providers.WebsocketProvider(WsXinfinMainnet);
      xdcInst = new Xdc3(xdcProvider);
      xdcProvider.on("connect", () => {
        console.log(`[*] xdc reconnected to ws at ${__filename}`);
        inReconnXDC = false;
        clearInterval(currInterval);
      });
    }, 5000);
  } catch (e) {
    console.log(`exception at ${__filename}.xdcReconn: `, e);
  }
}

connectionHeartbeat();