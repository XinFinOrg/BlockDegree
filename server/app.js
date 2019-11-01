let createError = require("http-errors");
let express = require("express");
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
let pendingTx = require("./listeners/pendingTx").em;
let app = express();
require("dotenv").config();
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
require("./services/passport")(passport);
mongoose.set("useCreateIndex", true);

// view engine setup
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "base",
    layoutsDir: path.join(process.cwd() + "/src/partials/layouts"),
    partialsDir: path.join(process.cwd() + "/src/partials/")
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

// required for passport
app.use(
  session({
    secret: "",
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 3600000
    }
  })
); // session secret
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

// catch 404 and render 404 page
app.use("*", function(req, res) {
  res.render("error");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen("3005", () => {
  pendingTx.emit("initiatePendingTx");
  console.log("server started");
});

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

if (!fs.existsSync("./server/cached")) {
  fs.mkdirSync("./server/cached");
}

module.exports = app;
