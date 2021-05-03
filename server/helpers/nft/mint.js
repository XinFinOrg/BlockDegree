const Xdc3 = require("xdc3");

const { ABI, ADDRESS } = require("./contract");
const keyConfig = require("../../config/keyConfig");
const { isUndefined } = require("lodash");

const HttpProvider = "https://rpc.xinfin.network";

const wallet_network = "50";

function getKey(wallet_network) {
  return keyConfig[
    Object.keys(keyConfig).filter(
      (x) => keyConfig[x].wallet_network == wallet_network
    )[0]
  ].privateKey;
}

/**
 *
 * @param {Object} data
 * @param {Object} data.name
 * @param {Object} data.description
 * @param {Object} data.tokenURI
 * @param {Object} data.owner
 */
const Mint = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, description, tokenURI, owner } = data;

      const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(HttpProvider));
      const contract = new xdc3.eth.Contract(ABI, ADDRESS);
      const totalSupply = await contract.methods.totalSupply().call();
      const assetId = parseFloat(totalSupply) + 1;

      const privateKey = getKey(wallet_network);

      const account = xdc3.eth.accounts.privateKeyToAccount(privateKey);

      if (isNaN(assetId)) resolve(null);

      const tx = {
        to: ADDRESS,
        from: account.address,
      };
      const tx_data = contract.methods
        .mint(owner, assetId, name, description, tokenURI)
        .encodeABI();
      tx.data = tx_data;
      tx.gas = await xdc3.eth.estimateGas(tx);
      tx.gasPrice = await xdc3.eth.getGasPrice();

      if (isUndefined(privateKey)) resolve(null);

      const signed = await xdc3.eth.accounts.signTransaction(tx, privateKey);
      xdc3.eth
        .sendSignedTransaction(signed.rawTransaction)
        .once("receipt", (receipt) => {
          console.log(receipt);
          resolve(receipt);
        });
    } catch (e) {
      console.log("Mint", e);
      resolve(null);
    }
  });
};

exports.Mint = Mint;
