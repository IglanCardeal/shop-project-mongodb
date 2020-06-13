const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const DBNAME = process.env.DB_NAME;

const url = `mongodb://${HOST}:${PORT}/${DBNAME}`;

module.exports = () => {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return;
};
