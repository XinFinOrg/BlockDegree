var User = require("../models/user");
const emailer = require("../emailer/impl");
const passport = require("passport");
const requireLogin = require("../middleware/requireLogin");
const handleClose = require("../middleware/handleClose");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");

module.exports = app => {
  app.get("/logout", function(req, res) {
    req.logout();
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    console.log("HIT current user");

    if (req.user) {
      res.json({ status: true, user: req.user });
    } else {
      res.json({ status: false, user: null });
    }
  });

  app.post("/signup", (req, res, next) => {
    passport.authenticate(
      "local-signup",
      {
        session: true
      },
      async (err, user, info) => {
        res.send({ status: user, message: info });
      }
    )(req, res, next);
  });

  app.post("/login", (req, res, next) => {
    passport.authenticate(
      "local-login",
      {
        session: true
      },
      async (err, user, info) => {
        if (user == false) {
          // login not done
          // return info
          console.log(info);
          return res.send({ status: user, message: info });
          // console.log("user logged in", user, info);
        }
        req.logIn(user, function(err) {
          if (err) {
            console.log("login err>>>>>>>>>>>", err);
          }
          res.send({ status: user, message: info });
          console.log("user logged in", user, info);
        });
      }
    )(req, res, next);
  });

  app.post("/forgotPassword", async (req, res) => {
    console.log("called forgot password");
    let result = await User.findOne({ email: req.body.email });
    if (result == null) {
      res.json({ message: "user not found", status: false });
    } else if (
      result.auth.local.password == null ||
      result.auth.local.password == ""
    ) {
      res.json({
        message: "Hmm, looks like you are signed in with a social account.",
        status: false
      });
    } else {
      emailer.forgotPasswordMailer(
        result.email,
        result.auth.local.password,
        res
      );
      res.json({ message: "email sent", status: true });
    }
  });

  app.get("/resetpassword", async (req, res) => {
    console.log(req.url);
    console.log("inside reset password");
    const token = req.query.email;
    const user = await User.findOne({ "auth.local.password": token });
    console.log(user);
    if (user != null) {
      // user is found
      console.log(user);
      res.sendFile("./resetpassword.html", {
        root: path.join(__dirname, "../../dist")
      });
    }
  });

  app.post("/updatePassword", async (req, res) => {
    console.log("called update password");
    // console.log(req.url)
    var data = JSON.stringify(req.body);
    var dataupdate = JSON.parse(data);
    console.log(data, dataupdate);
    const backUrl = req.header("Referer");
    console.log("BackURL:", backUrl);
    const params = backUrl.split("=");
    let token;
    if (params.length > 1) {
      token = params[1];
      userobj = new User();
      hash = userobj.generateHash(dataupdate.password);
      console.log(token);
      let user = await User.findOne({ "auth.local.password": token });
      console.log("Found User:  ", user);
      user.auth.local.password = hash;
      await user.save();
      res.redirect("/");
    }
  });

  app.get(
    "/auth/google",
    handleClose,
    passport.authenticate("google", {
      scope: ["profile ", "email"]
    })
  );

  app.get(
    "/auth/facebook",
    handleClose,
    passport.authenticate("facebook", {
      scope: ["public_profile", "email"]
    })
  );

  app.get("/auth/twitter", handleClose, passport.authenticate("twitter"));

  app.get("/auth/linkedin", handleClose, passport.authenticate("linkedin"));

  app.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (err != null) {
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect("/closeCallback");
          }
          var url = req.session.redirectTo || "/";
          if (
            url == "/login" ||
            url == "/exam-result" ||
            url.startsWith("/api")
          ) {
            url = "/";
          }
          // res.send({status:user,info:"msg"})
          res.redirect(url);
          // next();
        });
      }
    )(req, res, next);
  });

  app.get("/auth/facebook/callback", (req, res) => {
    passport.authenticate(
      "facebook",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (err != null) {
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect("/closeCallback");
          }
          var url = req.session.redirectTo || "/";
          if (
            url == "/login" ||
            url == "/exam-result" ||
            url.startsWith("/api")
          ) {
            url = "/";
          }
          res.redirect(url);
        });
      }
    )(req, res);
  });

  app.get("/auth/twitter/callback", (req, res) => {
    passport.authenticate(
      "twitter",
      { failureRedirect: "/login" },
      (err, user, info) => {
        console.log("Inside error is not null: ", err, user, info);
        if (err != null) {
          console.log("Inside error is not null: ", err, user, info);
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            return res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect("/closeCallback");
          }
          var url = req.session.redirectTo || "/";
          if (
            url == "/login" ||
            url == "/exam-result" ||
            url.startsWith("/api")
          ) {
            url = "/";
          }
          res.redirect(req.protocol + "://" + req.get("host") + url);
        });
      }
    )(req, res);
  });

  app.get("/auth/linkedin/callback", (req, res) => {
    passport.authenticate(
      "linkedin",
      { failureRedirect: "/login" },
      (err, user, info) => {
        if (err != null) {
          console.log("Inside error is not null: ", err, user, info);
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, err => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect("/closeCallback");
          }
          var url = req.session.redirectTo || "/";
          if (
            url == "/login" ||
            url == "/exam-result" ||
            url.startsWith("/api")
          ) {
            url = "/";
          }
          res.redirect(url);
        });
      }
    )(req, res);
  });

  app.post("/api/getAuthStatus", requireLogin, async (req, res) => {
    if (!req.user) {
      res.redirect("/login");
    }
    const user = await User.findOne({ email: req.user.email }).catch(err => {
      console.error(err);
      res.status(500).json({
        error: err,
        status: 500,
        info: "error while looking up the database for the user"
      });
    });
    res.status(200).json({
      localAuth: user.auth.local.password != "",
      twitterAuth: user.auth.twitter.id != "",
      facebookAuth: user.auth.facebook.id != "",
      googleAuth: user.auth.google.id != "",
      linkedinAuth: user.auth.linkedin.id != ""
    });
  });

  app.get("/api/isNameRegistered", requireLogin, async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).catch(e =>
      console.error(
        `Exception while looking up the user:${req.user.email} err : ${e}`
      )
    );
    if (user) {
      console.log(user.name != undefined && user.name != "");
      res.json({ isSet: user.name != undefined && user.name != "" });
    }
  });

  app.post("/api/setName", requireLogin, async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).catch(e => {
      console.error(`Error : ${e}`);
      return res.json({ msg: `error : ${e}` });
    });
    if (user == null) {
      return res.json({ msg: `no such user` });
    }
    user.name = req.body.fullName;
    await user.save();
    res.json({ msg: `Name set: ${req.body.fullName}` });
  });
};
