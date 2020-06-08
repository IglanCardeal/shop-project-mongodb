const dotenv = require('dotenv');
const open = require('open');

const dataBaseConnection = require('./database/connection');
const app = require('./app');

dotenv.config();

const { PORT = 3000 } = process.env;
const { NODE_ENV } = process.env;
const BASE_URL = `http://localhost:${PORT}`;
const { log } = console;

try {
  dataBaseConnection(() => {
    log('Connection to MongoDB stablished with success!');

    app.listen(PORT, () => {
      log(`Server On - PORT ${PORT} `);
      log(`Enviroment: ${NODE_ENV} `);

      // ===================== ATENCAO =======================
      // Comente esse bloco caso faca alteracoes no codigo.
      // Caso contratio, ao restart do nodemon, ira abrir uma
      // nova aba do firefox a cada restart do servidor.
      if (NODE_ENV === 'development') {
        log(`Lauching application on ${BASE_URL}`);

        open(BASE_URL);
      }
      // =====================================================
    });
  });
} catch (error) {
  log('Error while starting the server: ', error);
}
