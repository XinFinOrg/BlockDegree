const axios = require("axios");
const cmcKeys = require("../config/cmcKeys").keys;

let priceMultiplier = 1;

if (process.env.MODE === "uat" || process.env.MODE === "dev") {
  priceMultiplier = 100000;
}

let i = 0;
exports.getXdcPrice = async () => {
  try {
    // const cmc_xdc_data = await axios({
    //   method: "get",
    //   headers: {
    //     "X-CMC_PRO_API_KEY": cmcKeys[i++ % cmcKeys.length],
    //   },
    //   url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
    //   params: {
    //     id: "2634",
    //   },
    // });
    const resp = await axios.post(
      "https://explorer.xinfin.network/getXinFinStats"
    );
    const priceUsd = resp.data.priceUsd;

    return (
      parseFloat(priceUsd) *
      parseFloat(priceMultiplier)
    );
  } catch (e) {
    console.log(`exception at ${__filename}.getXdcPrice: `, e);
    return null;
  }
};

exports.usdToXdc = async (usd) => {
  try {
    // const cmc_xdc_data = await axios({
    //   method: "get",
    //   headers: {
    //     "X-CMC_PRO_API_KEY": cmcKeys[i++ % cmcKeys.length],
    //   },
    //   url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
    //   params: {
    //     id: "2634",
    //   },
    // });
    const resp = await axios.post(
      "https://explorer.xinfin.network/getXinFinStats"
    );
    const priceUsd = resp.data.priceUsd;
    return (
      parseFloat(usd) /
      (parseFloat(priceUsd) *
        parseFloat(priceMultiplier))
    );
  } catch (e) {
    console.log(`exception at ${__filename}.getXdcPrice: `, e);
    return null;
  }
};
/**
 * @param {Number|String} xdc amount of xdc
 * @return {Number}
 */
exports.xdcToUsd = async (xdc) => {
  try {
    // const cmc_xdc_data = await axios({
    //   method: "get",
    //   headers: {
    //     "X-CMC_PRO_API_KEY": cmcKeys[i++ % cmcKeys.length],
    //   },
    //   url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
    //   params: {
    //     id: "2634",
    //   },
    // });
    const resp = await axios.post(
      "https://explorer.xinfin.network/getXinFinStats"
    );
    const priceUsd = resp.data.priceUsd;
    return (
      parseFloat(xdc) *
      parseFloat(priceUsd) *
      priceMultiplier
    );
  } catch (e) {
    console.log(`exception at ${__filename}.getXdcPrice: `, e);
    return null;
  }
};
