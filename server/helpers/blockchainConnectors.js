  require("dotenv").config();
  const Xdc3 = require("xdc3");
  const Web3 = require("web3");
  const WebsocketProvider = require('web3-providers-ws'); // Added this line

  const xdcWs = require("./constant").WsXinfinMainnet;
  const ethWs = require("./constant").WsEthereumMainnet;
  const rinkWs = require("./constant").WsRinkebyTestnet;

  const path = require("path");

  const fileName = path.basename(__filename);

  // let xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
  // let ethProvider = new Web3.providers.WebsocketProvider(ethWs);


  console.log("xdcWs:", xdcWs);
  console.log("ethWs:", ethWs);
  console.log("rinkWs:", rinkWs);

  let xdcProvider = new WebsocketProvider(xdcWs); // Add this line
  let ethProvider = new WebsocketProvider(ethWs); // Add this line
  let rinkProvider = new Web3.providers.WebsocketProvider(rinkWs);

  // let xdc3 = new Xdc3(xdcProvider);
  // let web3 = new Web3(ethProvider);
  // let web3Rink = new Web3(rinkProvider);
  let xdc3 = new Xdc3(xdcProvider);
  let web3 = new Web3(ethProvider); // Replace the old instance with the new one
  let web3Rink = new Web3(rinkProvider);

  console.log("rinkProvider:", rinkProvider);


  let inReconnXDC = false,
    inReconnEth = false,
    inReconnRink = false;

  exports.xdcInst = xdc3;
  exports.ethInst = web3;
  exports.rinkInst = web3Rink;

  xdcProvider.on("connect", () => {
    console.log(`[*] xdc3 instance connected at ${fileName}`);
  });
  xdcProvider.on("end", () => {
    console.log(
      `[*] xdc3 instance disconnected at ${fileName}, starting reconn...`
    );
    xdcReconn();
  });

  ethProvider.on("connect", () => {
    console.log(`[*] eth instance connected at ${fileName}`);
  });
  ethProvider.on("end", () => {
    console.log(
      `[*] eth instance disconnected at ${fileName}, starting reconn...`
    );
    ethReconn();
  });

  rinkProvider.on("connect", () => {
    console.log(`[*] rinkeby instance connected at ${fileName}`);
  });
  rinkProvider.on("end", () => {
    console.log(
      `[*] rinkeby instance disconnected at ${fileName}, starting reconn...`
    );
    ethReconn();
  });

    connectionHeartbeat();

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
      console.log("[*] reconn xdc running");
      inReconnXDC = true;
      let currInterval = setInterval(() => {
        xdcProvider = new Xdc3.providers.WebsocketProvider(xdcWs);
        xdc3 = new Xdc3(xdcProvider);
        xdcProvider.on("connect", () => {
          console.log(`[*] xdc reconnected to ws at ${fileName}`);
          clearInterval(currInterval);
          exports.xdcInst = xdc3;
          inReconnXDC = false;
        });
      }, 5000);
    } catch (e) {
      console.log(`exception at ${__filename}.xdcReconn: `, e);
    }
  }

  function ethReconn() {
    try {
      console.log("[*] reconn eth running");
      inReconnEth = true;
      let currInterval = setInterval(() => {
        ethProvider = new Web3.providers.WebsocketProvider(ethWs);
        web3 = new Web3(ethProvider);
        ethProvider.on("connect", () => {
          console.log(`[*] eth reconnected to ws at ${fileName}`);
          clearInterval(currInterval);
          exports.ethInst = web3;
          inReconnEth = false;
        });
      }, 5000);
    } catch (e) {
      console.log(`exception at ${__filename}.xdcReconn: `, e);
    }
  }

  function rinkReconn() {
    try {
      console.log("[*] reconn rink running");
      inReconnRink = true;
      let currInterval = setInterval(() => {
        rinkProvider = new Web3.providers.WebsocketProvider(rinkWs);
        web3Rink = new Web3(rinkProvider);
        rinkProvider.on("connect", () => {
          console.log(`[*] rinkeby reconnected to ws at ${fileName}`);
          clearInterval(currInterval);
          exports.ethInst = web3Rink;
          inReconnRink = false;
        });
      }, 5000);
    } catch (e) {
      console.log(`exception at ${__filename}.xdcReconn: `, e);
    }
  }

  
  function connectionHeartbeat() {
    setInterval(async () => {
      try {
        const isActiveXdc = await xdc3.eth.net.isListening();
        if (process.env.enableBlockchainSync === 'true') {
          console.log(`Connection status XDC: ${isActiveXdc}`);
        }
        if (!isActiveXdc && inReconnXDC === false) {
          xdcReconn();
        }
      } catch (e) {
        if (inReconnXDC === false) {
          xdcReconn();
        }
      }
      try {
        const isActiveEth = await web3.eth.net.isListening();
        if (process.env.enableBlockchainSync === 'true') {
          console.log(`Connection status ETH: ${isActiveEth}`);
        }
        if (!isActiveEth && inReconnEth === false) {
          ethReconn();
        }
      } catch (e) {
        if (inReconnEth === false) {
          ethReconn();
        }
      }
      try {
        const isActiveRink = await web3Rink.eth.net.isListening();
        if (process.env.enableBlockchainSync === 'true') {
        console.log(`Connection status RINK: ${isActiveRink}`);
        }
        if (!isActiveRink && inReconnRink === false) {
          rinkReconn();
        }
      } catch (e) {
        if (inReconnRink === false) {
          rinkReconn();
        }
      }
    }, 5000);
  }
  

  // connectionHeartbeat();

