const dotenv = require('dotenv');

const dataBaseConnection = require('./database/connection');
const app = require('./app');

dotenv.config();

const { PORT = 3000 } = process.env;
const { NODE_ENV } = process.env;
const { log } = console;

try {
  dataBaseConnection(() => {
    log('Connection to MongoDB stablished with success!');

    app.listen(PORT, () => {
      log(`Server On - PORT ${PORT} `);
      log(`Enviroment: ${NODE_ENV} `);
    });
  });
} catch (error) {
  log('Error while starting the server: ', error);
}
