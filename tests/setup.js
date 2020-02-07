jest.setTimeout(60000);

require('../server/models/user');
const mongoose = require("mongoose");
const config = require("./config");

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

afterAll(async () => {
  console.log("called after all");
  await mongoose.disconnect()
})
