const mongoose = require("mongoose");
async function connect() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Travel");
    console.log("Connect to server successfully!!!");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { connect };
