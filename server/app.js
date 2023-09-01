require("dotenv").config();
let createError = require("http-errors");
let express = require("express");
const http = require("http");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let mongoose = require("mongoose");
let passport = require("passport");
let flash = require("connect-flash");
let bodyParser = require("body-parser");
let session = require("express-session");
let hbs = require("express-handlebars");
let cors = require("cors");
let fs = require("fs");
const expressFileUpload = require("express-fileupload");
let pendingTx = require("./listeners/pendingTx").em;
const adminServices = require("./services/adminServices");
const donationListener = require("../server/listeners/donationListener");
const updateSiteStats = require("./listeners/updateSiteStats");
const { forceReSync } = require("./services/postSocials");
const redis = require("redis");

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({ prefix: "blockdegree" });
global.RedisClient = redisClient;
let app = express();
const server = http.createServer(app);

mongoose.set("useCreateIndex", true);

require("./services/passport")(passport);

connectToMongoDB();

// view engine setup
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "base",
    layoutsDir: path.join(process.cwd() + "/src/partials/layouts"),
    partialsDir: path.join(process.cwd() + "/src/partials/"),
  })
);
app.set("views", path.join(process.cwd() + "/src/partials/layouts"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("dist", { extensions: ["html", "htm"] }));
app.use(
  express.static("server/protected/courses", { extensions: ["html", "htm"] })
);
app.use(cors());
app.use(
  expressFileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
// required for passport

const sessionParser = session({
  store: new RedisStore({
    client: redisClient,
    host: "localhost",
    port: 6379,
  }),
  secret: "",
  resave: true,
  rolling: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 10800000,
  },
});
app.use(sessionParser); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require("./routes/paymentRoutes.js")(app);
require("./routes/authRoutes")(app);
require("./routes/examRoutes")(app);
// require('./routes/paymentRoutes')(app) // Not working; need to make a further dive.
require("./routes/contentRoutes")(app);
require("./routes/emailVeriRoutes")(app);
require("./routes/shareSocialsRoutes")(app);
require("./routes/certificateRoutes")(app);
require("./routes/contactUsRoutes")(app);
require("./routes/promoCodeRoutes")(app);
require("./routes/adminRoutes")(app);
require("./routes/userProfileRoutes")(app);
require("./routes/fmdRoutes")(app);
require("./routes/nftRoutes")(app);

// remove the comment to serve from build
app.use("/newadmin", dynamicMiddleware);

require("./listeners/postSocial");
// catch 404 and render 404 page
app.use("*", function (req, res) {
  res.render("error");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen("3001", async () => {
  pendingTx.emit("initiatePendingTx");
  pendingTx.emit("initiatePendingBurn");
  pendingTx.emit("syncPendingBurnFMD");
  donationListener.em.emit("syncRecipients");
  donationListener.em.emit("syncPendingDonation");
  donationListener.em.emit("syncPendingBulkCoursePayments");
  updateSiteStats.em.emit("setSiteStats");
  forceReSync();

  WebSocketServer.initializeWebSocketServer(server, sessionParser); // Pass your server object and sessionParser function

  console.log("[*] server started");

  await adminServices.initiateWalletConfig();
  console.log("[*] server started");
});

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

if (!fs.existsSync("./server/cached")) {
  fs.mkdirSync("./server/cached");
}

function dynamicMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    if (process.env.ADMIN_ID.split("|").includes(req.user.email)) {
      express.static(path.join(__dirname, "./admin-new/build"))(req, res, next);
    } else {
      res.render("error");
    }
  } else {
    res.render("adminLogin");
  }
}

function connectToMongoDB() {
  try {
    mongoose
      .connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => {
        console.log("[*] connected to mongodb");
      })
      .catch((e) => {
        console.log("[*] error while connecting to mongodb: ", e);
        console.log("[*] Retrying connection to mongodb in 5 seconds...");
        setTimeout(connectToMongoDB, 5000);
      });
  } catch (err0) {
    console.log("[*] error while connecting to mongodb: ", err0);
    console.log(
      "[*] error while connecting to mongodb at :",
      process.env.DATABASE_URI
    );
    console.log("[*] Retrying connection to mongodb in 5 seconds...");
    setTimeout(connectToMongoDB, 5000);
  }
}
// require("./listeners/websocketServer").server(server, sessionParser);
// require("./listeners/websocketServer.js").server(server, sessionParser);
const WebSocketServerModule = require("./listeners/websocketServer.js");
WebSocketServerModule.initializeWebSocketServer(server, sessionParser);



module.exports = app;
