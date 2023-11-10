var User = require("../models/user");
const UserSession = require("../models/userSessions");
const emailer = require("../emailer/impl");
const passport = require("passport");
const axios = require("axios");
const FacebookConfig = require("../models/facebookConfig");
const userReferral = require("../listeners/userReferral");
const referralEmitter = userReferral.em;
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");
const handleClose = require("../middleware/handleClose");
const detectReferral = require("../middleware/detectReferral");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");

module.exports = (app) => {
  app.get("/logout", async function (req, res) {
    try{
    const email = req.user.email;
    const user = await User.findOne({email})
    const userSession = await UserSession.findOne({sessionId:user.userSession});
    if (user && userSession) {
      userSession.endTime = Date.now();
      user.userSession = "";
      await user.save();
      await userSession.save();
    }

    req.logout();
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }catch(e){
    console.log(e);
    res.redirect("/");
  }
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    console.log("HIT current user");

    if (req.user) {
      console.log(`User Logged In: ${req.user.email}`);
      res.json({ status: true, user: req.user });
    } else {
      res.json({ status: false, user: null });
    }
  });

  app.post("/signup", (req, res, next) => {
    passport.authenticate(
      "local-signup",
      {
        session: true,
      },
      async (err, user, info) => {
        res.send({ status: user, message: info });
      }
    )(req, res, next);
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local-login",
      {
        session: true,
      },
      async (err, user, info) => {
        if (user == false) {
          // login not done
          // return info
          console.log(info);
          return res.send({ status: user, message: info });
          // console.log("user logged in", user, info);
        }
        req.logIn(user, function (err) {
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
        status: false,
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

  app.post("/api/checkResetLink", async (req, res) => {
    console.log("inside reset password");
    const token = req.body.emailToken;
    const user = await User.findOne({ "auth.local.password": token });
    if (user == null) {
      console.log("invalid link");
      return res.json({ exists: false });
    } else {
      res.json({ exists: true });
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
      if (user == null) {
        return res.render("displayError", {
          error: "Broken reset password link",
        });
      }
      console.log("Found User:  ", user);
      user.auth.local.password = hash;
      await user.save();
      res.redirect("/");
    }
  });

  app.get(
    "/auth/google",
    handleClose,
    detectReferral,
    passport.authenticate("google", {
      scope: ["profile ", "email"],
    })
  );

  app.get(
    "/auth/facebook",
    handleClose,
    detectReferral,
    passport.authenticate("facebook", {
      scope: ["public_profile", "email"],
    })
  );

  app.get(
    "/admin/facebookRefresh",
    handleClose,
    // requireLogin, requireAdmin,
    passport.authenticate("facebookAdminRefresh", {
      scope: ["public_profile", "email"],
    })
  );

  app.get("/admin/facebookRefresh/callback", (req, res, next) => {
    passport.authenticate(
      "facebookAdminRefresh",
      { failureRedirect: "/" },
      (err, msg) => {
        console.log("Response In Callback: ", err, msg);
        if (err) {
          return res.render("displayError", { error: err });
        }
        const currToken = msg.token;

        const url = `https://graph.facebook.com/105301110986098?fields=access_token&access_token=${currToken}`;

        axios.get(url).then(async (resp) => {
          console.log("Response from Facebook");
          console.log(resp.data);
          if (resp.data && resp.data.id !== "") {
            const facebookConfig = await FacebookConfig.findOne({});
            if (facebookConfig === null) {
              console.log("config not initiated, initializing");
              const newFacebookConfig = genFacebookConfig();
              newFacebookConfig.shortTermToken = currToken;
              newFacebookConfig.lastUpdate = Date.now() + "";
              newFacebookConfig.longTermToken = resp.data.access_token;
              await newFacebookConfig.save();
              return res.redirect("/closeCallback");
            } else {
              console.log("already initiated, updating");
              if (resp.data.access_token === facebookConfig.access_token) {
                console.log("same token, not updated");
                return res.json({
                  status: false,
                  error: "same access_tokem, no updation performed",
                });
              } else {
                console.log("new access_token updating...");
                facebookConfig.access_token = resp.data.access_token;
                facebookConfig.lastUpdate = "" + Date.now();
                await facebookConfig.save();
                return res.redirect("/closeCallback");
              }
            }
          }
        });
      }
    )(req, res);
  });

  app.get("/auth/twitter", handleClose, detectReferral, passport.authenticate("twitter"));

  app.get("/auth/linkedin", handleClose, detectReferral, passport.authenticate("linkedin"));

  app.get("/auth/google/callback", (req, res, next) => {

    console.log('knejndwkndekjwebdwhjevdwbhjejd')
    passport.authenticate(
      "google",
      { failureRedirect: "/" },
      (err, user, info) => {
        if (err != null) {
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err,
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, (err) => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            return res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect(`/closeCallback?share=${req.session.shareModal}`);
          }
          if (info == "new-name") {
            console.log(req.session);            
            if (req.session.refIdUsed === true) {
              referralEmitter.emit("referralUsage", req.session.refIdValue, user.email);
            }
            referralEmitter.emit("createUserReferral", user.email);
            res.redirect("http://localhost:3010/profile?confirmName=true");
            return;
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
      { failureRedirect: "/" },
      (err, user, info) => {
        console.log("CAllback URL: ", req.originalUrl);
        if (req.originalUrl.split("?")[1].split("=")[0] == "error") {
          return res.redirect("/login");
        }
        if (err != null) {
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err,
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, (err) => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            return res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect(`/closeCallback?share=${req.session.shareModal}`);
          }
          if (info == "new-name") {
            if (req.session.refIdUsed === true) {
              referralEmitter.emit("referralUsage", req.session.refIdValue, user.email);
            }
            referralEmitter.emit("createUserReferral", user.email);
            res.redirect("/profile?confirmName=true");
            return;
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
      { failureRedirect: "/" },
      (err, user, info) => {
        console.log("Inside error is not null: ", err, user, info);
        if (err != null) {
          console.log("Inside error is not null: ", err, user, info);
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err,
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, (err) => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            return res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect(`/closeCallback?share=${req.session.shareModal}`);
          }
          if (info == "new-name") {
            if (req.session.refIdUsed === true) {
              referralEmitter.emit("referralUsage", req.session.refIdValue, user.email);
            }
            referralEmitter.emit("createUserReferral", user.email);
            res.redirect("/profile?confirmName=true");
            return;
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
      { failureRedirect: "/" },
      (err, user, info) => {
        if (err != null) {
          console.log("Inside error is not null: ", err, user, info);
          console.log(`Error: ${err}`);
          return res.render("displayError", {
            error: err,
          });
        }
        if (user == null) {
          return res.send({ status: user, message: info });
        }
        req.logIn(user, (err) => {
          if (err != null) {
            console.log(`Error while logging in ${err}`);
            return res.redirect("/login");
          }
          console.log(`User ${user.email} logged in.`);
          if (req.session.closeOnCallback) {
            return res.redirect(`/closeCallback?share=${req.session.shareModal}`);
          }
          if (info == "new-name") {
            if (req.session.refIdUsed === true) {
              referralEmitter.emit("referralUsage", req.session.refIdValue, user.email);
            }
            referralEmitter.emit("createUserReferral", user.email);
            res.redirect("/profile?confirmName=true");
            return;
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

  app.post("/api/getAuthStatus", async (req, res) => {
    if (req.user == undefined || req.user.email == undefined) {
      return res.status(200).json({
        localAuth: false,
        twitterAuth: false,
        facebookAuth: false,
        googleAuth: false,
        linkedinAuth: false,
      });
    }
    let user;
    try {
      user = await User.findOne({ email: req.user.email });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err,
        status: 500,
        info: "error while looking up the database for the user",
      });
    }
    res.status(200).json({
      localAuth: user.auth.local.password != "",
      twitterAuth: user.auth.twitter.id != "",
      facebookAuth: user.auth.facebook.id != "",
      googleAuth: user.auth.google.id != "",
      linkedinAuth: user.auth.linkedin.id != "",
    });
  });

  app.get("/api/isNameRegistered", requireLogin, async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).catch((e) =>
      console.error(
        `Exception while looking up the user:${req.user.email} err : ${e}`
      )
    );
    if (user) {
      console.log(user.name != undefined && user.name != "");
      res.json({ isSet: user.name != undefined && user.name != "" });
    }
  });

  app.post("/api/refIdExists", async (req, res) => {
    try {
      const exists = await userReferral.refIdExists(req.body.refId);
      res.json({ status: true, exists: exists });
    } catch (e) {
      console.log(`exception at ${__filename}.refIdExists: `, e);
      res.json({ status: false, error: "internal error" });
    }
  });
};

function genFacebookConfig() {
  return new FacebookConfig({
    shortTermToken: "",
    lastUpdate: "",
    expiryTime: "",
    longgTermToken: "",
  });
}
