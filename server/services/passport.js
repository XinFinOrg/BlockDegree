var LocalStrategy = require("passport-local").Strategy;
const googleStrategy = require("passport-google-oauth20").Strategy;
var User = require("../models/user");
var Token = require("../models/tokenVerification");
const emailer = require("../emailer/impl");
var crypto = require("crypto");
require("dotenv").config();

const facebookStrategy = require("passport-facebook").Strategy;
const twitterStrategy = require("passport-twitter").Strategy;
const linkedinStrategy = require("passport-linkedin-oauth2").Strategy;

function newDefaultUser() {
  return new User({
    email: "",
    name: "",
    pubKey:"",
    examData: {
      payment: {
        course_1: false,
        course_2: false,
        course_3: false
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
              console.log(user.auth.local.password);

              if (user.auth.local.password != "") {
                console.log("email already taken");
                return done(null, false, "That email is already taken.");
              } else {
                console.log("email registered to another social");
                return done(
                  null,
                  false,
                  "This email is registered to another one of the socials below."
                );
              }
            } else {
              console.log("in method creating user");
              var newUser = newDefaultUser();
              newUser.email = email;
              newUser.auth.local.password = newUser.generateHash(password);
              newUser.save(function(err) {
                if (err) {
                  console.log("Error:", err);
                  throw err;
                }

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
        User.findOne({ email: email }, function(err, user) {
          if (err) return done(err);
          else if (!user) return done(null, false, "No user found.");
          else if (!user.validPassword(password))
            return done(null, false, "Oops! Wrong password.");
          else if (!user.auth.local.isVerified)
            return done(
              null,
              false,
              "User is not verified, Please check your email"
            );
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
        // callbackURL: "http://ga.blockdegree.org:3001/auth/google/callback",
        callbackURL: "http://localhost:3000/auth/google/callback",

        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        if (req.user) {
          if (
            req.user.auth.google.id == "" ||
            req.user.auth.google.id == undefined
          ) {
            let user = await User.findOne({ email: req.user.email });
            user.auth.google.id = profile.id;
            user.auth.google.accessToken = accessToken;
            user.auth.google.refreshToken = refreshToken;
            user.save();
            return done(null,user)
          }
          return done(null, req.user);
        }
        const existingUser = await User.findOne({
          "auth.google.id": profile.id
        });
        if (existingUser) {
          // console.log(` In passport verification ${existingUser.email}`)
          return done(null, existingUser);
        }
        if (profile.emails.length < 1) {
          return done({ error: "email-id not associated", status: 400 }, null);
        }
        newUser = newDefaultUser();
        newUser.auth.google.id = profile.id;
        newUser.email = profile.emails[0].value;
        newUser.name = profile._json.name;
        newUser.auth.google.accessToken = accessToken;
        newUser.auth.google.refreshToken = refreshToken;
        const user = await new User(newUser).save();
        done(null, user);
      }
    )
  );

  // Login with Facebook
  passport.use(
    new facebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        // callbackURL: "http://ga.blockdegree.org:3001/auth/facebook/callback",
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        passReqToCallback: true,
        profileFields: ["id", "emails", "name"]
      },
      async (req, accessToken, refreshToken, profile, done) => {
        if (req.user) {
          if (
            req.user.auth.facebook.id == "" ||
            req.user.auth.facebook.id == undefined
          ) {
            let user = await User.findOne({ email: req.user.email });
            user.auth.facebook.id = profile.id;
            user.auth.facebook.accessToken = accessToken;
            user.auth.facebook.refreshToken = refreshToken;
            user.save();
            return done(null, user);
          }
          return done(null, req.user);
        }
        var existingUser = await User.findOne({
          "auth.facebook.id": profile.id
        });
        if (existingUser) {
          return done(null, user);
        }
        if (profile.emails.length < 1) {
          return done({ error: "email-id not associated", status: 400 }, null);
        }
        existingUser = await User.findOne({
          "email":profile.emails[0].value
        });
        if (existingUser){
          let user = await User.findOne({ email: profile.emails[0].value });
            user.auth.facebook.id = profile.id;
            user.auth.facebook.accessToken = accessToken;
            user.auth.facebook.refreshToken = refreshToken || "";
            user.save();
            return done(null, user);
        }
        newUser = newDefaultUser();
        newUser.email = profile.emails[0].value;
        newUser.auth.facebook.id = profile.id;
        newUser.auth.facebook.accessToken = accessToken;
        newUser.auth.facebook.refreshToken = refreshToken || "";
        const user = await new User(newUser).save();
        done(null, user);
      }
    )
  );

  // Login with Twitter
  passport.use(
    new twitterStrategy(
      {
        consumerKey: process.env.TWITTER_CLIENT_ID,
        consumerSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: "/auth/twitter/callback",
        includeEmail: true,
        passReqToCallback: true
      },
      async (req, token, tokenSecret, profile, done) => {
        if (req.user) {
          if (
            req.user.auth.twitter.id == "" ||
            req.user.auth.twitter.id == undefined
          ) {
            let user = await User.findOne({ email: req.user.email });
            user.auth.twitter.id = profile.id;
            user.auth.twitter.token = token;
            user.auth.twitter.tokenSecret = tokenSecret;
            user.save();
            return done(null, user);
          }
          return done(null, req.user);
        }
        var existingUser = await User.findOne({
          "auth.twitter.id": profile.id
        });
        if (existingUser) {
          return done(null, existingUser);
        }
        if (profile.emails.length < 1) {
          return done({ error: "email-id not associated", status: 400 }, null);
        }
        existingUser = await User.findOne({
          "email":profile.emails[0].value
        });
        if (existingUser){
          let user = await User.findOne({ email: profile.emails[0].value });
            user.auth.twitter.id = profile.id;
            user.auth.twitter.token = token;
            user.auth.twitter.tokenSecret = tokenSecret;
            user.save();
            return done(null, user);
        }
        newUser = newDefaultUser();
        newUser.auth.twitter.id = profile.id;
        newUser.name = profile.displayName;
        newUser.email = profile.emails[0].value;
        newUser.auth.twitter.token = token;
        newUser.auth.twitter.tokenSecret = tokenSecret;
        const user = await new User(newUser).save();
        done(null, user);
      }
    )
  );

  // Login with Linkedin
  passport.use(
    new linkedinStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT,
        clientSecret: process.env.LINKEDIN_SECRET,
        // callbackURL: "http://ga.blockdegree.org:3001/auth/linkedin/callback",
        callbackURL: "http://localhost:3000/auth/facebook/callback",
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
              let user = await User.findOne({ email: req.user.email });
              user.auth.linkedin.id = profile.id;
              user.auth.linkedin.accessToken = accessToken;
              user.save();
              return done(null, user);
            }
            return done(null, req.user);
          }
          var existingUser = await User.findOne({
            "auth.linkedin.id": profile.id
          });
          if (existingUser) {
            return done(null, existingUser);
          }
          if (profile.emails.length < 1) {
            return done(
              { error: "email-id not associated", status: 400 },
              null
            );
          }
          existingUser = await User.findOne({
            "email":profile.emails[0].value
          });
          if (existingUser){
            let user = await User.findOne({ email: profile.emails[0].value });
              user.auth.linkedin.id = profile.id;
              user.auth.linkedin.accessToken = accessToken;
              user.save();
              return done(null, user);
          }
          newUser = newDefaultUser();
          newUser.auth.linkedin.id = profile.id;
          newUser.name = profile.displayName;
          newUser.email = profile.emails[0].value;
          newUser.auth.linkedin.accessToken = accessToken;
          const user = await new User(newUser).save();
          return done(null, user);
        });
      }
    )
  );
};
