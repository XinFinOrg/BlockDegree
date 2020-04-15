const UserWallet = require("../models/userWallet");
const UserWalletLogs = require("../models/userWalletLogs");
const User = require("../models/user");
const UserCurrencyHelper = require("./userCurrency");
const Notification = require("../models/notifications");
const xdcInst = require("./blockchainConnectors").xdcInst;
const { removeExpo } = require("./common");

exports.createUserWallet = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    if (user === null) {
      return { status: false, error: "user not found" };
    }
    const existingWallet = await UserWallet.findOne({ email: email });
    if (existingWallet !== null) {
      return { status: false, error: "wallet already exists" };
    }
    const newAddr = UserCurrencyHelper.createNewAddress();
    const newWallet = newWalletStub(email, newAddr.address, newAddr.privateKey);
    await newWallet.save();
    console.log(`[*] new wallet generated for user ${email}`);

    return { status: true, data: "new wallet generated" };
  } catch (e) {
    console.log(`exception at $${__filename}.createUserWallet: `, e);
    return { status: false, error: e };
  }
};

exports.transferInternal = (from, to, value) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fromWallet = await UserWallet.findOne({ walletAddress: from });
      if (fromWallet === null ) {
        return reject("wallet(s) not found");
      }
      const nonce = await xdcInst.eth.getTransactionCount();
      const gasPrice = await xdcInst.eth.getGasPrice();
      value = removeExpo(Math.round(parseFloat(value)));
      const rawTx = {
        from: fromWallet.walletAddress,
        to: to,
        nonce: nonce,
        chainId: "50",
        gas: 1000000,
        value: value,
        gasPrice: gasPrice,
      };
      const signed = await xdcInst.eth.accounts.signTransaction(
        rawTx,
        fromWallet.walletPrivateKey
      );
      const walletTxLog = newWalletTransferStub(
        fromWallet.walletAddress,
        to,
        value
      );
      await walletTxLog.save();
      xdcInst.eth
        .sendSignedTransaction(signed.rawTransaction)
        .then(async (receipt) => {
          if (receipt.status == true) {
            resolve(receipt);
            walletTxLog.status = "completed";
            await walletTxLog.save();
          } else {
            reject(receipt);
          }
        })
        .catch((err0) => {
          console.log("exception at transferInternal: ", err0);
        });
    } catch (err1) {
      console.log("exception at transferInternal: ", err1);
      reject(err1);
    }
  });
};

function newWalletStub(email, walletAddress, walletPrivateKey) {
  return new UserWallet({
    email: email,
    walletAddress: walletAddress,
    walletPrivateKey: walletPrivateKey,
    createAt: Date.now(),
  });
}

function newWalletTransferStub(from, to, value) {
  return new UserWalletLogs({
    from: from,
    to: to,
    value: value,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "pending",
  });
}
