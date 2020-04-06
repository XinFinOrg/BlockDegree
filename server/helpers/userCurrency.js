"use strict";
const _ = require("lodash");
const xdc3 = require("./blockchainConnectors").xdcInst;
const web3 = require("./blockchainConnectors").ethInst;

/**
 * will return address and privateKey of a newly generated address
 */
exports.createNewAddress = () => {
  try {
    const addr = xdc3.eth.accounts.create();
    if (
      addr !== null &&
      !_.isEmpty(addr.address) &&
      !_.isEmpty(addr.privateKey)
    ) {
      return {
        address: addr.address,
        privateKey: addr.privateKey
      };
    } else {
      return null;
    }
  } catch (e) {
    console.log(`exception at ${__filename}.createNewAddress: `, e);
    return null;
  }
};

/**
 * returns the 0x address from the private key
 * @param {string} privKey valid private key
 * @returns {string}
 */
exports.getAccountFromPrivKey = privKey => {
  try {
    if (_.isEmpty(privKey)) {
      return null;
    }
    if (!privKey.startsWith("0x")) {
      privKey = "0x" + privKey;
    }
    const addr = web3.eth.accounts.privateKeyToAccount(privKey);
    if (addr === null && _.isEmpty(addr.address)) {
      return null;
    }
    return addr.address;
  } catch (e) {
    console.log(`exception at ${__filename}.getAccountFromPrivKey: `, e);
    return null;
  }
};

/**
 *
 */
exports.createAndSignTx = async (to, privKey, value) => {
  try {
    if (!privKey.startsWith("0x")) {
      privKey = "0x" + privKey;
    }
    const addr = web3.eth.accounts.privateKeyToAccount(privKey);
    if (addr === null && _.isEmpty(addr.address)) {
      return null;
    }
    const tx = {
      to: to,
      from: addr.address
    };
    if (!_.isEmpty(value)) {
      tx["value"] = value;
    }
    tx["nonce"] = await web3.eth.getTransactionCount(addr.address);
    tx["gasLimit"] = await web3.eth.estimateGas(tx);
    const signed = await web3.eth.accounts.signTransaction(tx, privKey);
    return signed;
  } catch (e) {
    console.log(`exception at ${__filename}.createAndSignTx: `, e);
    return null;
  }
};
