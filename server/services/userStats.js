const User = require("../models/user");

exports.getAllUserTimestamp = async (req, res) => {
  const users = await User.find({});
  console.log(users);
  let retTimestamp = {};
  users.forEach(user => {
    const email = getEmail(user);
    retTimestamp[email] = user._id.getTimestamp();
    console.log(user._id.getTimestamp());
    console.log(Date.parse(user._id.getTimestamp()));
  });
  res.status(200).json(retTimestamp);
};

exports.getUsersLastNDays = async (req, res) => {
  const users = await User.find({});
  let count = 0;
  let today = new Date();
  const timeWindow = req.body.days * (1000 * 3600 * 24);
  today.setHours(0, 0, 0, 0);
  let retTimestamp = [];
  users.forEach(async user => {
    const email = getEmail(user);
    const userDate = new Date(user._id.getTimestamp());
    if (userDate.getTime() > today.getTime()) {
      // registered today, gets a pass
      retTimestamp.push({ email: email, time: userDate });
      count++;
      return;
    }
    const timeDiff = Math.abs(today.getTime() - userDate.getTime());
    if (timeDiff < timeWindow) {
      retTimestamp.push({ email: email, time: userDate });
      count++;
    }
  });
  res.status(200).json(retTimestamp);
};

exports.getUserLastQuater = async (req, res) => {
  let retUsers = [];
  const users = await User.find({});
  let today = new Date();
  let currMonth = today.getMonth();
  users.forEach(user => {
    const email = getEmail(user);
    const userDate = new Date(user._id.getTimestamp());
    if (currMonth - userDate.getMonth() <= 3) {
      retUsers.push({ email: email, time: userDate });
    }
  });
  console.log(retUsers);
  res.status(200).json(retUsers);
};

function getEmail(user) {
  return user.email;
}

exports.getByLastActiveDay = async (req, res) => {
  const users = await User.find({});
  let today = new Date();
  const timeWindow = req.body.days * (1000 * 3600 * 24);
  today.setHours(0, 0, 0, 0);
  let retTimestamp = [];
  users.forEach(async user => {
    const email = getEmail(user);
    if (user.lastActive != "") {
      const userDate = new Date(parseFloat(user.lastActive));
      if (userDate.getTime() > today.getTime()) {
        // registered today, gets a pass
        console.log(user);
        retTimestamp.push({ email: email, time: userDate });
        return;
      }
      const timeDiff = Math.abs(today.getTime() - userDate.getTime());
      if (timeDiff < timeWindow) {
        retTimestamp.push({ email: email, time: userDate });
      }
    }
  });
  //   console.log(retTimestamp)
  res.status(200).json(retTimestamp);
};

exports.getMostActive = async (req, res) => {
  const timeWindow = req.body.days * (1000 * 3600 * 24);
  const users = await User.find({});
  let retUser = [];
  users.forEach(async user => {
    if (parseFloat(user.lastActive) - parseFloat(user.created) <= timeWindow) {
      // active-ness falls in the window range
      retUser.push({
        email: user.email,
        time: parseFloat(user.lastActive) - parseFloat(user.created)
      });
    }
  });
  res.status(200).json(retUser);
};
