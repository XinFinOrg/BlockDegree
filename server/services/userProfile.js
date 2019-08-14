const User = require("../models/user");

exports.setupProfile = async (req, res) => {
  console.log("called setup profile");
  const user = await User.findOne({ email: req.user.email }).catch(e =>
    console.error(`Exception in setupProfile ${e}`)
  );
  if (!user) {
    return console.error(`User not found, seems like the DB is down`);
  }
  // check for req.body params, omitting now
  let newProfile = {
    photo: {
      name: "",
      buffer: ""
    },
    education_details: [{}]
  };
  newProfile.education_details = [{ any: "ok" }];
  newProfile.photo.name = res.locals.file_name;
  newProfile.photo.buffer = req.file.buffer.toString("base64");
  user.profile = newProfile;
  await user.save();
  res.json({ msg: "ok" });
};

exports.getProfile = async (req, res) => {
  console.log("called get profile");
  const user = await User.findOne({ email: req.user.email }).catch(e =>
    console.error(`Exception in setupProfile ${e}`)
  );
  if (!user) {
    return console.error(`User not found, seems like the DB is down`);
  }
  res.json(user.profile);
};

exports.addProfileEdu = async (req, res) => {
  console.log("called add profile edu");
  const user = await User.findOne({ email: req.user.email }).catch(e =>
    console.error(`Exception in setupProfile ${e}`)
  );
  if (!user) {
    return console.error(`User not found, seems like the DB is down`);
  }
  await User.updateOne(
    { email: req.user.email },
    { $push: { "profile.education_details": { test: "ok" } } }
  );
  await user.save();
  res.json({ msg: "ok" });
};

exports.updateProfilePhoto = async (req, res) => {
  console.log("called update profile photo");
  const user = await User.findOne({ email: req.user.email }).catch(e =>
    console.error(`Exception in setupProfile ${e}`)
  );
  if (!user) {
    return console.error(`User not found, seems like the DB is down`);
  }
  user.profile.photo.name = res.locals.file_name;
  user.profile.photo.buffer = req.file.buffer.toString("base64");
  user.save();
};

exports.deleteProfileEdu = async (req, res) => {
  console.log("called delete profile edu");
  const user = await User.findOne({ email: req.user.email }).catch(e =>
    console.error(`Exception in setupProfile ${e}`)
  );
  if (!user) {
    return console.error(`User not found, seems like the DB is down`);
  }
  req.body.eduDels.forEach(edu => {
    delete user.profile.education_details[edu];
  });
  user.save();
  res.json({ msg: "ok" });
};
