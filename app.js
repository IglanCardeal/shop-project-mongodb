/**
 * @onlineshopproject
 * @author Iglan Cardeal
 * @githubrespository https://github.com/IglanCardeal/shop-project-mongodb
 * Projeto de shop online feito em NodeJS, Express e MongoDB.
 */

const dotenv = require("dotenv");
dotenv.config();

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
const multer = require("multer");
const fileUploadHandler = require("./middleware/file-upload-handler");
const open = require("open");

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

// Middlewares.
const preventCsrf = require("./middleware/prevent-csrf");
const checkSession = require("./middleware/check-session");
const sessionSetup = require("./middleware/session-setup");
const serverErrorHandler = require("./middleware/server-error-handler");

// Setup das engines e views.
app.set("view engine", "ejs");
app.set("views", "./app/views");

/**
 * @helmet pode ajudar a proteger o aplicativo de algumas vulnerabilidades da web
 * bastante conhecidas configurando os cabeçalhos HTTP adequadamente.
 */
app.use(helmet());
app.use(session(sessionSetup(sessionDataBase)));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  multer({
    storage: fileUploadHandler(multer).fileStorage,
    fileFilter: fileUploadHandler(multer).fileFilter
  }).single("image")
);
app.use(express.static(path.join(__dirname, "app", "public")));
app.use(express.static(path.join(__dirname))); // para arquivos de imagens de usuario.
app.use(csrf());
app.use(flash());
app.use(checkSession);
app.use(preventCsrf);

// Setup das rotas.
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
app.use(serverErrorHandler);

process.on("uncaughtException", error => {
  console.log("Uncaught Error while starting: ", error);
  process.exit(1);
});

try {
  dataBaseConnection(() => {
    console.log("Connection to MongoDB stablished with success!");
    app.listen(PORT, async () => {
      if (process.env.NODE_ENV === "PRODUCTION") {
        await open(`http://localhost:${PORT}`, { app: "firefox" });
      }
      console.log(`Server On - PORT ${PORT}`);
      console.log(`Enviroment: ${process.env.NODE_ENV}`);
    });
  });
} catch (error) {
  console.log("Error while starting the server: ", error);
}
