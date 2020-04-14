const Xdc3 = require("xdc3");
const Web3 = require("web3");

const xdcWs = require("./constant").WsXinfinMainnet;
const ethWs = require("./constant").WsEthereumMainnet;
const rinkWs = require("./constant").WsRinkebyTestnet;

const path = require("path");

const fileName = path.basename(__filename);

let xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
let ethProvider = new Web3.providers.WebsocketProvider(ethWs);
let rinkProvider = new Web3.providers.WebsocketProvider(rinkWs);

let xdc3 = new Xdc3(xdcProvider);
let web3 = new Web3(ethProvider);
let web3Rink = new Web3(rinkProvider);

exports.xdcInst = xdc3;
exports.ethInst = web3;
exports.rinkInst = web3Rink;

xdcProvider.on("connect", () => {
  console.log(`[*] xdc3 instance connected at ${fileName}`);
  connectionHeartbeat();
});
xdcProvider.on("end", () => {
  console.log(
    `[*] xdc3 instance disconnected at ${fileName}, starting reconn...`
  );
  xdcReconn();
});

ethProvider.on("connect", () => {
  console.log(`[*] eth instance connected at ${fileName}`);
  connectionHeartbeat();
});
ethProvider.on("end", () => {
  console.log(
    `[*] eth instance disconnected at ${fileName}, starting reconn...`
  );
  ethReconn();
});

rinkProvider.on("connect", () => {
  console.log(`[*] rinkeby instance connected at ${fileName}`);
  connectionHeartbeat();
});
rinkProvider.on("end", () => {
  console.log(
    `[*] rinkeby instance disconnected at ${fileName}, starting reconn...`
  );
  ethReconn();
});

//---------------------- Connector Func Exports Starts------------------------

/**
 * returns the status of current blockchain connections
 */
exports.getCurrentStatus = async () => {
  try {
    const isActiveXdc = await xdc3.eth.net.isListening();
    const isActiveEth = await web3.eth.net.isListening();
    const isActiveRink = await web3Rink.eth.net.isListening();

    return { xdc: isActiveXdc, eth: isActiveEth, rink: isActiveRink };
  } catch (e) {
    console.log(`exception at ${__filename}.getCurrentStatus: `, e);
    return null;
  }
};

exports.restartConnection = ({ eth, xdc }) => {
  try {
    if (xdc === true) {
      xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
      xdc3 = new Xdc3(xdcProvider);
      exports.xdcInst = xdc3;
    }
    if (eth === true) {
      webProvider = new Web3.providers.WebsocketProvider(ethWs);
      web3 = new Web3(ethProvider);
      exports.ethInst = web3;
    }
    return "restarted";
  } catch (e) {
    console.log(`exception at ${__filename}.restartCOnnection: `, e);
    return null;
  }
};

//---------------------- Connector Func Exports Ends------------------------

function xdcReconn() {
  try {
    let currInterval = setInterval(() => {
      xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
      xdc3 = new Xdc3(xdcProvider);
      xdcProvider.on("connect", () => {
        console.log(`[*] xdc reconnected to ws at ${fileName}`);
        clearInterval(currInterval);
        exports.xdcInst = xdc3;
      });
    }, 5000);
  } catch (e) {
    console.log(`exception at ${__filename}.xdcReconn: `, e);
  }
}

function ethReconn() {
  try {
    let currInterval = setInterval(() => {
      ethProvider = new Web3.providers.WebsocketProvider(ethWs);
      web3 = new Web3(ethProvider);
      ethProvider.on("connect", () => {
        console.log(`[*] eth reconnected to ws at ${fileName}`);
        clearInterval(currInterval);
        exports.ethInst = web3;
      });
    }, 5000);
  } catch (e) {
    console.log(`exception at ${__filename}.xdcReconn: `, e);
  }
}

function rinkReconn() {
  try {
    let currInterval = setInterval(() => {
      rinkProvider = new Web3.providers.WebsocketProvider(rinkProvider);
      web3Rink = new Web3(rinkProvider);
      rinkProvider.on("connect", () => {
        console.log(`[*] rinkeby reconnected to ws at ${fileName}`);
        clearInterval(currInterval);
        exports.ethInst = web3Rink;
      });
    }, 5000);
  } catch (e) {
    console.log(`exception at ${__filename}.xdcReconn: `, e);
  }
}

function connectionHeartbeat() {
  setInterval(async () => {
    try{
      const isActiveXdc = await xdc3.eth.net.isListening();
      if (!isActiveXdc) xdcReconn();
    }catch(e){
      xdcReconn();
    }
    try{
      const isActiveEth = await web3.eth.net.isListening();
      if (!isActiveEth) ethReconn();
    }
    catch(e){
      ethReconn();
    }
    try{
      const isActiveRink = await web3Rink.eth.net.isListening();
      if (!isActiveRink) rinkReconn();
    }
    catch(e){
      rinkReconn();
    }
  }, 5000);
}
