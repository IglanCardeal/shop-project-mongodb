// Controla o ENV da aplicacao.
const checkNodeEnv = require("./check-node-env");
checkNodeEnv();

const PORT = process.env.PORT || 3000;
const MONGODB_URL = `
  mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
`;

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const session = require("express-session");
const SessionStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
// const opn = require("opn");

// Setup do app e armazenamento das sessoes.
const app = express();
const sessionDataBase = new SessionStore({
  uri: MONGODB_URL,
  collection: "session"
});

// Rotas.
const adminRoutes = require("./app/routes/admin");
const shopRoutes = require("./app/routes/shop");
const authRoutes = require("./app/routes/auth");
const errorController = require("./app/controllers/error-controller");

// DataBase connection file.
const dataBaseConnection = require(path.resolve("database", "connection"));

// Setup das engines e views.
app.set("view engine", "ejs");
app.set("views", "./app/views");

// Middlewares.
const preventCsrf = require("./middleware/prevent-csrf");
const checkSession = require("./middleware/check-session");

/**
 * @helmet pode ajudar a proteger o aplicativo de algumas vulnerabilidades da web
 * bastante conhecidas configurando os cabeçalhos HTTP adequadamente.
 */
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "app", "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: sessionDataBase
  })
);
app.use(csrf());
app.use(flash());
app.use(checkSession);
app.use(preventCsrf);

// Setup das rotas.
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

process.on("uncaughtException", error => {
  console.log("Uncaught Error: ", error);
  process.exit(1);
});

dataBaseConnection(() => {
  console.log("Connection to MongoDB stablished with success!");
  app.listen(PORT, () => {
    console.log(`Server On - PORT ${PORT}`);
  });
});
