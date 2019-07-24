const passport = require("passport");
const mongoose = require("mongoose");
const googleStrategy = require("passport-google-oauth20").Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
const keys = require("../config/keys");
const twitterStrategy = require('passport-twitter').Strategy;
const linkedInStrategy = require("passport-linkedin").Strategy;

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new googleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);

passport.use(new facebookStrategy({
  clientID: keys.facebookClientID,
  clientSecret: keys.facebookClientSecret,
  callbackURL: "/auth/facebook/callback"
},
async (accessToken, refreshToken, profile, done) => {
  const existingUser = await User.findOne({ facebookId: profile.id });
  if (existingUser) {
    return done(null, existingUser);
  }
  const user = await new User({ facebookId: profile.id }).save();
  done(null, user);
}
));

passport.use(new twitterStrategy({
  consumerKey: keys.twitterClientID,
  consumerSecret: keys.twitterClientSecret,
  callbackURL: "/auth/twitter/callback"
},
async (token, tokenSecret, profile, done) =>{
  const existingUser = await User.findOne({ twitterId: profile.id });
  if (existingUser) {
    return done(null, existingUser);
  }
  const user = await new User({ twitterId: profile.id }).save();
  done(null, user);
}
));

passport.use(new linkedInStrategy({
  consumerKey: keys.linkedInKey,
  consumerSecret: keys.linkedInSecret,
  callbackURL: "/auth/linkedin/callback"
},
async (token, tokenSecret, profile, done) =>{
  const existingUser = await User.findOne({ linkedinId: profile.id });
  if (existingUser) {
    return done(null, existingUser);
  }
  const user = await new User({ linkedinId: profile.id }).save();
  done(null, user);
}
));
