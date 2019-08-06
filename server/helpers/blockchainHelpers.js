const Web3 = require("web3");
const EthereumTx = require("ethereumjs-tx");
const keythereum = require("keythereum");
const User = require("../models/user");

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
  console.log(`User Key: ${user.pubKey}`)
  const keyObj = keythereum.importFromFile(
    coinbase_acnt,
    process.env.DEF_KEY_PATH
  );
  const privateKey = keythereum.recover(process.env.DEF_ACCOUNT_PWD, keyObj);
  const count = await web3.eth.getTransactionCount(coinbase_acnt).catch(err => {
    console.error(err);
    throw err;
  });
  var rawTransaction = {
    from: coinbase_acnt,
    gasPrice: web3.utils.toHex(20 * 1e9),
    gasLimit: web3.utils.toHex(2100000),
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
    chainId: 989899
  };

  var transaction = new EthereumTx(rawTransaction);

  transaction.sign(privateKey);
  web3.eth
    .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
    .on("transactionHash", console.log)
    .catch(err => {
      throw err;
    });
    return
};

async function createKeystore(emailId) {
  const user = await User.findOne({ email: emailId }).catch(err => {
    console.error(err);
    throw err;
  });
  if (!user) {
    console.error("no user associated with this account!");
    return null;
  }
  const dk = keythereum.create();
  const keyObj = keythereum.dump(process.env.KEYSTORE_PWD, dk.privateKey, dk.salt,dk.iv);
  keythereum.exportToFile(keyObj, "./server/keystore");
  const pubKey = web3.eth.accounts.privateKeyToAccount(dk.privateKey).address;
  user.pubKey = pubKey;
  user.save();
  return pubKey;
}

exports.getUserData = () => {};

exports.getAttemptByHash = async hash => {};
