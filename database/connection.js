const mongoose = require("mongoose");

const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const DBNAME = process.env.DB_NAME;

module.exports = async callback => {
  const url = `mongodb://${HOST}:${PORT}/${DBNAME}`;
  try {
    await mongoose.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    return callback();
  } catch (error) {
    console.log("Error to connect database! ", error);
  }
};