const UserWallet = require("../models/userWallet");
const User = require("../models/user");
const UserCurrencyHelper = require("../helpers/userCurrency");
const Notification = require("../models/notifications");

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

function newWalletStub(email, walletAddress, walletPrivateKey) {
  return new UserWallet({
    email: email,
    walletAddress: walletAddress,
    walletPrivateKey: walletPrivateKey,
  });
}
