const WebSocket = require("ws");
const User = require("../models/user");
const EventEmitter = require("events").EventEmitter;
const em = new EventEmitter();

/**
 * @param server server object
 * @param sessionParser session parser
 */
exports.server = (server, sessionParser) => {
  const wss = new WebSocket.Server({
    port: 3050,
    server: server,
    verifyClient: (info, done) => {
      console.log("Parsing session info from request...");
      sessionParser(info.req, {}, () => {
        done(info.req.session);
      });
    },
  });

  wss.on("connection", async function (ws, request) {
    console.log("new websocket connection request");

    const userId = request.session;
    if (
      !userId.passport ||
      request.headers.origin !== "https://uat.blockdegree.org"
    ) {
      console.log(`[*] invalid access at websocket`);
      ws.close();
      return;
    }

    const user = await User.findById(userId.passport.user).lean();

    if (user === null) {
      console.log(`[*] user not found at websocket`);
      ws.close();
      return;
    }

    em.on("new-noti", (email) => {
      if (email === user.email) {
        ws.send(JSON.stringify({ newNoti: true }));
      }
    });

    ws.on("close", function () {});
  });
};

exports.em = em;
