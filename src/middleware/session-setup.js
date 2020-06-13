const session = require('express-session');
const SessionStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');

dotenv.config();

const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const DBNAME = process.env.DB_NAME;

const uri = `mongodb://${HOST}:${PORT}/${DBNAME}`;

const sessionDataBase = new SessionStore({
  uri: uri,
  collection: 'session',
});

module.exports = {
  secret: [
    'lord_vader_will_smash_the_rebels',
  ],
  resave: false, // Nao renova id de sessao.
  saveUninitialized: false, // Nao salva se a sessao nao for iniciada.
  cookie: {
    path: '/',
    secure: false, // 'true' para conexao HTTPS.
    maxAge: null, // encerra sessao ao fechar o browser.
    httpOnly: true, // Cookie nao pode ser lido por JS client side.
    sameSite: true, // envio restrito somente a origem.
  },
  store: sessionDataBase, // objeto de conexao com o banco.
};
