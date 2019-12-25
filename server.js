const dotenv = require('dotenv');

const dataBaseConnection = require('./database/connection');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 3000;
const { log } = console;

try {
  dataBaseConnection(() => {
    log('Connection to MongoDB stablished with success!');

    app.listen(PORT, () => {
      log(`Server On - PORT ${PORT} `);
      log(`Enviroment: ${process.env.NODE_ENV} `);
    });
  });
} catch (error) {
  log('Error while starting the server: ', error);
}
