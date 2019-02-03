// Controla o ENV da aplicacao.
const checkNodeEnv = require("./check-node-env");
checkNodeEnv();

const PORT = process.env.PORT || 3000;
const MONGODB_URL = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${
  process.env.DB_NAME
}`;
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

// Models.
const User = require("./app/models/user");

// Setup das engines e views.
app.set("view engine", "ejs");
app.set("views", "./app/views");

// Middlewares.
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
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
app.use(async (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/login");
  req.user = user;
  next();
});
app.use((req, res, next) => {
  // res.locals permite atribuir propriedades que serao passadas para todas as views
  // que forem renderizadas.
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Setup das rotas.
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

process.on("uncaughtException", error => {
  console.log("Uncaught Error: ", error);
  process.exit(1);
});

dataBaseConnection(async () => {
  console.log("Connection to MongoDB stablished with success!");
  app.listen(PORT, () => {
    console.log(`Server On - PORT ${PORT}`);
  });
});
