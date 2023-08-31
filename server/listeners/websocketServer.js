const WebSocket = require("ws");
const User = require("../models/user");
const EventEmitter = require("events").EventEmitter;
const uuid = require("uuid/v4");
const em = new EventEmitter();
const CLIENTS = [];
/**
 * @param server server object
 * @param sessionParser session parser
 */
// exports.server = (server, sessionParser) => {
//   const wss = new WebSocket.Server({
//     port: 3050,
//     server: server,
//     verifyClient: (info, done) => {
//       console.log("Parsing session info from request...");
//       sessionParser(info.req, {}, () => {
//         done(info.req.session);
//       });
//     },
//   });

exports.initializeWebSocketServer = (server, sessionParser) => {
  const wss = new WebSocket.Server({
    noServer: true, // Use noServer to manually attach to existing server
    verifyClient: (info, done) => {
      console.log("Parsing session info from request...");
      sessionParser(info.req, {}, () => {
        done(info.req.session);
      });
    },
  });

  module.exports.server = function(server, sessionParser) {

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", async function (ws, request) {
    console.log("new websocket connection request");
    
    // Your existing code for handling the WebSocket connection goes here

    ws.on("message", (msg) => {
      console.log("got message: ", msg);
    });
    
    ws.send("PONG");
    
    ws.on("close", function () {
      console.log(`[*] ws closed ${currId}`);
      removeFromClient(currId);
    });
  });
};
};
//   wss.on("connection", async function (ws, request) {
//     console.log("new websocket connection request");
//     let currId = uuid();
//     CLIENTS.push({ id: currId, ws: ws });
//     // const userId = request.session;
//     // if (
//     //   !userId.passport
//     //   // request.headers.origin !== "https://www.blockdegree.org"
//     // ) {
//     //   console.log(`[*] invalid access at websocket`);
//     //   ws.close();
//     //   return;
//     // }

//     // const user = await User.findById(userId.passport.user).lean();

//     // if (user === null) {
//     //   console.log(`[*] user not found at websocket`);
//     //   ws.close();
//     //   return;
//     // }

//     // em.on("new-noti", (email) => {
//     //   if (email === user.email) {
//     //     ws.send(JSON.stringify({ newNoti: true }));
//     //   }
//     // });

//     // // will be called whenever someone buys/gets s course enrollment
//     // em.on("fmd-trigger", () => {
//     //   ws.send("fmd:fetch-fmd");
//     // });

//     ws.on("message", (msg) => {
//       console.log("got message: ", msg);
//     });
//     ws.send("PONG");
//     ws.on("close", function () {
//       console.log(`[*] ws closed ${currId}`);
//       removeFromClient(currId);
//     });
//   });
// };

function broadcastToAll(eventName) {
  CLIENTS.forEach((obj) => {
    obj.ws.send(`${eventName}`)
  });
}

function removeFromClient(currId) {
  try {
    for (let i = 0; i < CLIENTS.length; i++) {
      const currWs = CLIENTS[i];
      if (currWs === undefined || currWs === null) continue;
      if (currWs.id === currId) {
        delete CLIENTS[i];
        console.log(`[*] deleted ws ${currId}`);
        return;
      }
    }
  } catch (e) {
    console.log(`exception at ${__filename}.removeFromClient`);
  }
}

em.on("fmd-trigger", broadcastToAll, "fmd:fetch-fmd");


exports.em = em;
