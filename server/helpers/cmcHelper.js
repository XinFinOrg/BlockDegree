const axios = require("axios");
const cmcKeys = require("../config/cmcKeys").keys;
let i = 0;
exports.getXdcPrice = async () => {
  try {
    const cmc_xdc_data = await axios({
      method: "get",
      headers: {
        "X-CMC_PRO_API_KEY": cmcKeys[i++ % cmcKeys.length],
      },
      url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      params: {
        id: "2634",
      },
    });
    return cmc_xdc_data;
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
    const cmc_xdc_data = await axios({
      method: "get",
      headers: {
        "X-CMC_PRO_API_KEY": cmcKeys[i++ % cmcKeys.length],
      },
      url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      params: {
        id: "2634",
      },
    });
    return (
      parseFloat(xdc) *
      parseFloat(cmc_xdc_data.data.data["2634"].quote.USD.price)
    );
  } catch (e) {
    console.log(`exception at ${__filename}.getXdcPrice: `, e);
    return null;
  }
};
