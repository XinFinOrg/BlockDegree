const LocalStrategy = require("passport-local").Strategy;
const googleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const UserSession = require("../models/userSessions");
const Token = require("../models/tokenVerification");
const emailer = require("../emailer/impl");
const socialPostListener = require("../listeners/postSocial").em;
const socialPostKeys = require("../config/socialPostKeys");
const referralEmitter = require("../listeners/userReferral").em;
const crypto = require("crypto");
const uuid = require("uuid/v4")
require("dotenv").config();

const facebookStrategy = require("passport-facebook").Strategy;
const twitterStrategy = require("passport-twitter").Strategy;
const linkedinStrategy = require("passport-linkedin-oauth2").Strategy;

function newDefaultUser() {
  return new User({
    email: "",
    name: "",
    created: "",
    lastActive: "",
    userSession:"",
    profile: {},
    examData: {
      payment: {
        course_1: false,
        course_2: false,
        course_3: false,
        course_4: false,
        course_5: false,
        course_6: false,
      },
      examBasic: {
        attempts: 0,
        marks: 0
      },
      examAdvanced: {
        attempts: 0,
        marks: 0
      },
      examProfessional: {
        attempts: 0,
        marks: 0
      },
      certificateHash: [{}]
    },
    auth: {
      facebook: {
        id: "",
        accessToken: "",
        refreshToken: ""
      },
      twitter: {
        id: "",
        token: "",
        tokenSecret: ""
      },
      google: {
        id: "",
        accessToken: "",
        refreshToken: ""
      },
      local: {
        password: "",
        isVerified: false
      },
      linkedin: {
        refreshToken:"",
        accessToken: "",
        id: ""
      }
    }
  });
}

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        console.log(req.body, email, password);
        process.nextTick(function() {
          User.findOne({ email: email }, function(err, user) {
            if (err) {
              console.log("some error", err);
              return done(err);
            }

            if (user) {
              if (user.auth.local.password != "") {
                console.log("email already taken");
                return done(null, false, "That email is already taken.");
              } else {
                console.log("email registered to another social");
                return done(
                  null,
                  false,
                  "This email is registered to another one of the socials."
                );
              }
            } else {
              // Validating user
              let refId = req.body.refId;            
              let validEm = validateEmail(email),
                validPwd = validatePWD(password),
                validFN = validateName(req.body.firstName),
                validLN = validateName(req.body.lastName);
              if (!validEm.valid) {
                return done(null, false, "Invalid Email");
              }
              if (!validPwd.valid) {
                return done(null, false, validPwd.msg);
              }
              if (!validFN.valid) {
                return done(null, false, validFN.msg);
              }
              if (!validLN.valid) {
                return done(null, false, validLN.msg);
              }
              console.log("in method creating user");
              var newUser = newDefaultUser();
              newUser.email = email;
              newUser.name = formatName(
                req.body.firstName + " " + req.body.lastName
              );
              newUser.timestamp = Date.now();
              newUser.timestamp = Date.now();
              newUser.auth.local.password = newUser.generateHash(password);
              newUser.created = Date.now();
              newUser.lastActive = Date.now();
              newUser.save(function(err) {
                if (err) {
                  console.log("Error:", err);
                  throw err;
                }

                socialPostListener.emit("varTriggerUpdate", "registrations");

                var token = new Token({
                  email: email,
                  token: crypto.randomBytes(16).toString("hex")
                });
                token.save(function(err) {
                  if (err) {
                    console.log(err);
                    return done(null, false, "token errror");
                  }
                  console.log(email, token);
                  emailer
                    .sendTokenMail(email, token, req, "signup")
                    .then(res => console.log("emailer res>>>>>", res))
                    .catch(err => console.log("emailer err>>>>", err));
                  referralEmitter.emit("createUserReferral", email);
                  if (refId!==""){
                    console.log(`|${refId}|`);
                    
                    referralEmitter.emit("referralUsage", refId, email);
                  }
                  return done(null, newUser);
                });
              });
            }
          });
        });
      }
    )
  );
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, email, password, done) {
        let validEm = validateEmail(email);
        if (!validEm.valid) {
          return done(null, false, "Invalid email");
        }

        User.findOne({ email: email }, async function(err, user) {
          if (err) return done(err);
          if (!user) return done(null, false, "No user found.");
          if (user.auth.local.password == "") {
            console.log("Proper call");
            return done(
              null,
              false,
              "Email associated with a existing social login."
            );
          }
          if (!user.validPassword(password))
            return done(null, false, "Oops! Wrong password.");
          if (!user.auth.local.isVerified)
            return done(
              null,
              false,
              "User is not verified, Please check your email"
            );
          user.lastActive = Date.now();

          let sessionId = uuid();
          user.userSession = sessionId;

          let newSession = genSession(sessionId);
          newSession.email = user.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "local";
          await newSession.save();

          await user.save();
          return done(null, user);
        });
      }
    )
  );

  // Google with Google
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3010/auth/google/callback",
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        if (req.user) {
          if (
            req.user.auth.google.id == "" ||
            req.user.auth.google.id == undefined
          ) {
            // check if the credentials are associated with any other user.
            let otherUser = await User.findOne({
              "auth.google.id": profile.id
            });
            if (otherUser != null) {
              // this set of credentials are associated with another account, show error
              return done(
                "This social account is already linked to other account, please try logging in with other account.",
                null,
                "This social account is already linked to other account, please try logging in with other account."
              );
            }
            let user = await User.findOne({ email: req.user.email });
            user.auth.google.id = profile.id;
            user.auth.google.accessToken = accessToken;
            user.auth.google.refreshToken = refreshToken;
            user.lastActive = Date.now();

            let sessionId = uuid();
            user.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "google";
            await newSession.save();

            await user.save();
            return done(null, user);
          }
          let user = await User.findOne({ email: req.user.email });
          user.lastActive = Date.now();


          let sessionId = uuid();
          user.userSession = sessionId;

          let newSession = genSession(sessionId);
          newSession.email = user.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "google";
          await newSession.save();


          await user.save();
          return done(null, req.user);
        }
        // find user by google id
        const existingUser = await User.findOne({
          "auth.google.id": profile.id
        });
        if (existingUser) {
          // console.log(` In passport verification ${existingUser.email}`)
          existingUser.lastActive = Date.now();


          let sessionId = uuid();
          existingUser.userSession = sessionId;

          let newSession = genSession(sessionId);
          newSession.email = existingUser.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "google";
          await newSession.save();


          await existingUser.save();
          return done(null, existingUser);
        }

        // email registered
        if (profile.emails.length > 0) {
          const linkEmail = await User.findOne({
            email: profile.emails[0].value
          });
          if (linkEmail) {
            linkEmail.auth.google.id = profile.id;
            linkEmail.auth.google.accessToken = accessToken;
            linkEmail.auth.google.refreshToken = refreshToken;
            linkEmail.lastActive = Date.now();


            let sessionId = uuid();
            linkEmail.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = linkEmail.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "google";
            await newSession.save();


            await linkEmail.save();
            return done(null, linkEmail);
          }
        }

        if (profile.emails.length < 1) {
          return done(
            "no email-id not associated with this social account",
            null,
            "no email-id not associated with this social account"
          );
        }
        newUser = newDefaultUser();
        newUser.auth.google.id = profile.id;
        newUser.email = profile.emails[0].value;
        newUser.name = formatName(profile._json.name);
        newUser.auth.google.accessToken = accessToken;
        newUser.auth.google.refreshToken = refreshToken;
        newUser.created = Date.now();
        newUser.lastActive = Date.now();
        
        let sessionId = uuid();
        newUser.userSession = sessionId;

        let newSession = genSession(sessionId);
        newSession.email = newUser.email;
        newSession.ip = req.headers["x-forwarded-for"] || req.ip;
        newSession.startTime = Date.now();
        newSession.platform = "google";
        await newSession.save();        

        await newUser.save();
        socialPostListener.emit("varTriggerUpdate", "registrations");
        done(null, newUser, "new-name");
      }
    )
  );

  // Login with Facebook
  passport.use(
    new facebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "https://www.blockdegree.org/auth/facebook/callback",
        passReqToCallback: true,
        profileFields: ["id", "emails", "name", "displayName"]
      },
      async (req, accessToken, refreshToken, profile, done) => {
        process.nextTick(async function() {
          if (req.user) {
            if (
              req.user.auth.facebook.id == "" ||
              req.user.auth.facebook.id == undefined
            ) {
              // check if the credentials are associated with any other user.
              let otherUser = await User.findOne({
                "auth.facebook.id": profile.id
              });
              if (otherUser != null) {
                // this set of credentials are associated with another account, show error
                return done(
                  "This social account is already linked to other account, please try logging in with other account.",
                  null,
                  "This social account is already linked to other account, please try logging in with other account."
                );
              }
              let user = await User.findOne({ email: req.user.email });
              user.auth.facebook.id = profile.id;
              user.auth.facebook.accessToken = accessToken;
              user.auth.facebook.refreshToken = refreshToken;
              user.lastActive = Date.now();


            let sessionId = uuid();
            user.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "facebook";
            await newSession.save();

              await user.save();
              return done(null, user);
            }
            let user = await User.findOne({ email: req.user.email });
            let otherUserSocial = await User.findOne({
              "auth.facebook.id": profile.id
            });
            if (otherUserSocial!==null && otherUserSocial.email!==user.email){
              return done(
                "This social account is not linked to your account.",
                null,
                "This social account is not linked to your account."
              );
            }
            user.auth.facebook.accessToken = accessToken;
            user.auth.facebook.refreshToken = refreshToken;
            user.lastActive = Date.now();

            let sessionId = uuid();
            user.userSession = sessionId;
  
            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "facebook";
            await newSession.save();

            await user.save();
            return done(null, req.user);
          }
          if (!profile) {
            return done("Profile not set", null);
          }
          let existingUser = await User.findOne({
            "auth.facebook.id": profile.id
          });
          if (existingUser) {
            existingUser.auth.facebook.accessToken = accessToken;
            existingUser.auth.facebook.refreshToken = refreshToken || "";
            existingUser.lastActive = Date.now();

            let sessionId = uuid();
            existingUser.userSession = sessionId;
  
            let newSession = genSession(sessionId);
            newSession.email = existingUser.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "facebook";
            await newSession.save();

            await existingUser.save();
            return done(null, existingUser);
          }

          if (profile.emails == undefined || profile.emails == null) {
            return done(
              "no email-id not associated with this social account",
              null,
              "no email-id not associated with this social account"
            );
          }

          // email registered
          if (profile.emails.length > 0) {
            const linkEmail = await User.findOne({
              email: profile.emails[0].value
            });
            if (linkEmail) {
              linkEmail.auth.facebook.id = profile.id;
              linkEmail.auth.facebook.accessToken = accessToken;
              linkEmail.auth.facebook.refreshToken = refreshToken || "";
              linkEmail.lastActive = Date.now();


            let sessionId = uuid();
            linkEmail.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = linkEmail.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "facebook";
            await newSession.save();

              await linkEmail.save();
              done(null, linkEmail);
            }
          }

          let existingUser2 = await User.findOne({
            email: profile.emails[0].value
          });
          if (existingUser2) {
            let user = await User.findOne({ email: profile.emails[0].value });
            user.auth.facebook.id = profile.id;
            user.auth.facebook.accessToken = accessToken;
            user.auth.facebook.refreshToken = refreshToken || "";
            user.lastActive = Date.now();

            let sessionId = uuid();
            user.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "facebook";
            await newSession.save();
            
            await user.save();
            return done(null, user);
          }
          newUser = newDefaultUser();
          newUser.email = profile.emails[0].value;
          newUser.auth.facebook.id = profile.id;
          newUser.auth.facebook.accessToken = accessToken;
          newUser.auth.facebook.refreshToken = refreshToken || "";
          newUser.name = formatName(profile.displayName);
          newUser.created = Date.now();
          newUser.lastActive = Date.now();

          let sessionId = uuid();
          newUser.userSession = sessionId;
  
          let newSession = genSession(sessionId);
          newSession.email = newUser.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "facebook";
          await newSession.save();     

          await newUser.save();
          socialPostListener.emit("varTriggerUpdate", "registrations");
          done(null, newUser, "new-name");
        });
      }
    )
  );

  passport.use(
    "facebookAdminRefresh",
    new facebookStrategy(
      {
        clientID: socialPostKeys.facebook.app_id,
        clientSecret: socialPostKeys.facebook.app_secret,
        callbackURL: "https://www.blockdegree.org/admin/facebookRefresh/callback"
      },
      async (token, tokenSecret, profile, done) => {
        if (profile.emails[0].value === socialPostKeys.facebook.email){
          console.log(`Token: ${token} TokenSecret: ${tokenSecret}`);
          console.log(`Profile: ${profile}`);
          done(null, { token: token, tokenSecret: tokenSecret });
        }
        else{
          console.log(`Admin tried to referesh token with different account ${profile.emails[0].value}, actual: ${socialPostKeys.facebook.email}.`);
          done("invalid facaebook account", null);
        }        
      }
    )
  );

  // Login with Twitter
  passport.use(
    new twitterStrategy(
      {
        consumerKey: process.env.TWITTER_CLIENT_ID,
        consumerSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: "https://www.blockdegree.org/auth/twitter/callback",
        includeEmail: true,
        passReqToCallback: true
      },
      async (req, token, tokenSecret, profile, done) => {
        console.log("called twitter auth");
        if (req.user) {
          if (
            req.user.auth.twitter.id == "" ||
            req.user.auth.twitter.id == undefined
          ) {
            // check if the credentials are associated with any other user.
            let otherUser = await User.findOne({
              "auth.twitter.id": profile.id
            });
            if (otherUser != null) {
              // this set of credentials are associated with another account, show error
              return done(
                "This social account is already linked to other account, please try logging in with other account.",
                null,
                "This social account is already linked to other account, please try logging in with other account."
              );
            }

            // add credentials
            let user = await User.findOne({ email: req.user.email });
            let otherUserSocial = await User.findOne({
              "auth.twitter.id": profile.id
            });
            if (otherUserSocial!==null && otherUserSocial.email!==user.email){
              return done(
                "This social account is not linked to your account.",
                null,
                "This social account is not linked to your account."
              );
            }
            user.auth.twitter.id = profile.id;
            user.auth.twitter.token = token;
            user.auth.twitter.tokenSecret = tokenSecret;
            user.lastActive = Date.now();

            let sessionId = uuid();
            user.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "twitter";
            await newSession.save();


            await user.save();
            return done(null, user);
          }
          let user = await User.findOne({ email: req.user.email });
          user.auth.twitter.token = token;
          user.auth.twitter.tokenSecret = tokenSecret;
          user.lastActive = Date.now();

          let sessionId = uuid();
          user.userSession = sessionId;

          let newSession = genSession(sessionId);
          newSession.email = user.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "twitter";
          await newSession.save();


          await user.save();
          return done(null, req.user);
        }
        let existingUser = await User.findOne({
          "auth.twitter.id": profile.id
        });
        if (existingUser) {
          existingUser.auth.twitter.token = token;
          existingUser.auth.twitter.tokenSecret = tokenSecret;
          existingUser.lastActive = Date.now();

          let sessionId = uuid();
          existingUser.userSession = sessionId;

          let newSession = genSession(sessionId);
          newSession.email = existingUser.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "twitter";
          await newSession.save();

          await existingUser.save();
          return done(null, existingUser);
        }

        if (profile.emails == undefined || profile.emails == null) {
          return done(
            "no email-id not associated with this social account",
            null,
            "no email-id not associated with this social account"
          );
        }

        // Link auths via email
        if (profile.emails.length > 0) {
          const linkEmail = await User.findOne({
            email: profile.emails[0].value
          });
          if (linkEmail) {
            linkEmail.auth.twitter.id = profile.id;
            linkEmail.auth.twitter.token = token;
            linkEmail.auth.twitter.tokenSecret = tokenSecret;
            linkEmail.lastActive = Date.now();

            let sessionId = uuid();
            linkEmail.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = linkEmail.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "twitter";
            await newSession.save();


            await linkEmail.save();
            return done(null, linkEmail);
          }
        }

        let existingUser2 = await User.findOne({
          email: profile.emails[0].value
        });
        if (existingUser2) {
          let user = await User.findOne({ email: profile.emails[0].value });
          user.auth.twitter.id = profile.id;
          user.auth.twitter.token = token;
          user.auth.twitter.tokenSecret = tokenSecret;
          user.lastActive = Date.now();

          let sessionId = uuid();
          user.userSession = sessionId;

          let newSession = genSession(sessionId);
          newSession.email = user.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "twitter";
          await newSession.save();

          await user.save();
          return done(null, user);
        }
        newUser = newDefaultUser();
        newUser.auth.twitter.id = profile.id;
        newUser.name = formatName(profile.displayName);
        newUser.email = profile.emails[0].value;
        newUser.auth.twitter.token = token;
        newUser.auth.twitter.tokenSecret = tokenSecret;
        newUser.created = Date.now();
        newUser.lastActive = Date.now();

        let sessionId = uuid();
        newUser.userSession = sessionId;

        let newSession = genSession(sessionId);
        newSession.email = newUser.email;
        newSession.ip = req.headers["x-forwarded-for"] || req.ip;
        newSession.startTime = Date.now();
        newSession.platform = "twitter";
        await newSession.save();     

        await newUser.save();
        socialPostListener.emit("varTriggerUpdate", "registrations");
        done(null, newUser, "new-name");
      }
    )
  );

  // Login with Linkedin
  passport.use(
    new linkedinStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: "https://www.blockdegree.org/auth/linkedin/callback",
        scope: ["r_liteprofile", "r_emailaddress", "w_member_social"],
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        process.nextTick(async function() {
          if (req.user) {
            if (
              req.user.auth.linkedin.id == "" ||
              req.user.auth.linkedin.id == undefined
            ) {
              // check if the credentials are associated with any other user.
              let otherUser = await User.findOne({
                "auth.linkedin.id": profile.id
              });
              if (otherUser != null) {
                // this set of credentials are associated with another account, show error
                return done(
                  "This social account is already linked to other account, please try logging in with other account.",
                  null,
                  "This social account is already linked to other account, please try logging in with other account."
                );
              }

              // add credentials

              let user = await User.findOne({ email: req.user.email });
              user.auth.linkedin.id = profile.id;
              user.auth.linkedin.accessToken = accessToken;
              user.auth.linkedin.refreshToken = refreshToken;
              user.lastActive = Date.now();

              let sessionId = uuid();
              user.userSession = sessionId;
  
              let newSession = genSession(sessionId);
              newSession.email = user.email;
              newSession.ip = req.headers["x-forwarded-for"] || req.ip;
              newSession.startTime = Date.now();
              newSession.platform = "linkedin";
              await newSession.save();

              await user.save();
              return done(null, user);
            }
            let user = await User.findOne({ email: req.user.email });
            let otherUserSocial = await User.findOne({
              "auth.linkedin.id": profile.id
            });
            if (otherUserSocial!==null&&otherUserSocial.email!==user.email){
              return done(
                "This social account is not linked to your account.",
                null,
                "This social account is not linked to your account."
              );
            }
            user.auth.linkedin.accessToken = accessToken;
            user.auth.linkedin.refreshToken = refreshToken;
            user.lastActive = Date.now();

            let sessionId = uuid();
            user.userSession = sessionId;
  
            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "linkedin";
            await newSession.save();

            await user.save();
            return done(null, user);
          }
          let  existingUser = await User.findOne({
            "auth.linkedin.id": profile.id
          });
          if (existingUser) {
            // need to refresh token
            existingUser.auth.linkedin.accessToken = accessToken;
            existingUser.auth.linkedin.refreshToken = refreshToken;
            existingUser.lastActive = Date.now();

            let sessionId = uuid();
            existingUser.userSession = sessionId;
  
            let newSession = genSession(sessionId);
            newSession.email = existingUser.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "linkedin";
            await newSession.save();

            await existingUser.save();
            return done(null, existingUser);
          }

          if (profile.emails == undefined || profile.emails == null) {
            return done(
              "no email-id not associated with this social account",
              null,
              "no email-id not associated with this social account"
            );
          }

          if (profile.emails.length > 0) {
            const linkEmail = await User.findOne({
              email: profile.emails[0].value
            });
            if (linkEmail) {
              linkEmail.auth.linkedin.id = profile.id;
              linkEmail.auth.linkedin.accessToken = accessToken;
              linkEmail.auth.linkedin.refreshToken = refreshToken;
              linkEmail.lastActive = Date.now();


            let sessionId = uuid();
            linkEmail.userSession = sessionId;

            let newSession = genSession(sessionId);
            newSession.email = linkEmail.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "linkedin";
            await newSession.save();

              await linkEmail.save();
              return done(null, linkEmail);
            }
          }

          let existingUser2 = await User.findOne({
            email: profile.emails[0].value
          });
          if (existingUser2) {
            let user = await User.findOne({ email: profile.emails[0].value });
            user.auth.linkedin.id = profile.id;
            user.auth.linkedin.accessToken = accessToken;
            user.auth.linkedin.refreshToken = refreshToken;
            user.lastActive = Date.now();

            let sessionId = uuid();
            user.userSession = sessionId;
  
            let newSession = genSession(sessionId);
            newSession.email = user.email;
            newSession.ip = req.headers["x-forwarded-for"] || req.ip;
            newSession.startTime = Date.now();
            newSession.platform = "linkedin";
            await newSession.save();

            await user.save();
            return done(null, user);
          }
          newUser = newDefaultUser();
          newUser.auth.linkedin.id = profile.id;
          newUser.name = formatName(profile.displayName);
          newUser.email = profile.emails[0].value;
          newUser.auth.linkedin.accessToken = accessToken;
          newUser.created = Date.now();
          newUser.lastActive = Date.now();

          let sessionId = uuid();
          newUser.userSession = sessionId;
  
          let newSession = genSession(sessionId);
          newSession.email = newUser.email;
          newSession.ip = req.headers["x-forwarded-for"] || req.ip;
          newSession.startTime = Date.now();
          newSession.platform = "linkedin";
          await newSession.save();     

          await newUser.save();
          socialPostListener.emit("varTriggerUpdate", "registrations");
          done(null, newUser, "new-name");
        });
      }
    )
  );
};

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return { valid: re.test(email) };
}

function validatePWD(pwd) {
  let upperCaseLetters = /[A-Z]/g;
  let numbers = /[0-9]/g;
  let validPWD = false;
  let msg;
  if (!pwd.match(numbers)) {
    msg = "Atleast One Number";
  }
  if (!pwd.match(upperCaseLetters)) {
    msg = "Atlest One Uppercase";
  }
  if (pwd.length < 8) {
    msg = "Atlest 8 characters";
  }
  if (pwd.match(numbers) && pwd.match(numbers) && pwd.length >= 8) {
    validPWD = true;
    msg = null;
  }
  return { msg: msg, valid: validPWD };
}

function validateName(name) {
  let validFN = true;
  let onlyWhiteSpace = "^\\s+$";
  let anyWhitespace = ".*\\s.*";
  let onlyLetter = "^[a-zA-Z]+$";
  let msg;
  if (!name.match(onlyLetter)) {
    msg = "name should consist of only letters";
    validFN = false;
  }
  if (name.match(onlyWhiteSpace) || name.match(anyWhitespace)) {
    // Has a whitespace
    msg = "no space allowed in first-name";
    validFN = false;
  }
  if (name.length < 2) {
    msg = "name too short";
    validFN = false;
  }
  if (name.length > 20) {
    msg = "name too long";
    validFN = false;
  }
  return { msg: msg, valid: validFN };
}

function formatName(fullName) {
  const lowerFN = fullName.toLowerCase();
  const splitFN = lowerFN.split(" ");
  let formattedName = "";
  for (name of splitFN) {
    formattedName += name.charAt(0).toUpperCase() + name.slice(1) + " ";
  }
  const finalFN = formattedName.trim();
  return finalFN;
}

function genSession(id){
  return new UserSession({
    sessionId: id,
    email: '',
    startTime: '',
    endTime: '',
    ip: '',
    platform:''
  })
}

function validateRefId(refId) {
  if (refId.length===15 && refId.startsWith("bd-")){
    return true;
  }
  return false
}
