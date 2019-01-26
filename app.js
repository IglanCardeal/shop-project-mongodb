const PORT = process.env.PORT || 3000;
// const opn = require("opn");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");

// DataBase connection file.
const dataBaseConnection = require(path.resolve("database", "connection"));

// Models.
const User = require("./app/models/user");

// Setup das engines e views.
app.set("view engine", "ejs");
app.set("views", "./app/views");

// Rotas.
const adminRoutes = require("./app/routes/admin");
const shopRoutes = require("./app/routes/shop");
const errorController = require("./app/controllers/error-controller");

// Middlewares.
app.use(helmet());
// extended: true - para o middleware parsear objetos aninhados.
// bodyParser.urlencoded({extended: ...}) basically tells the system whether you want to use a simple algorithm for shallow parsing (i.e. false)
// or complex algorithm for deep parsing that can deal with nested objects (i.e. true).
app.use(bodyParser.urlencoded({ extended: true }));
// descomentar para quando usar dados em JSON.
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "app", "public")));
//  -------------------------------------------------------------------------------------------------------------------------------------------

// Associando um user qualquer para testes.
app.use(async (req, res, next) => {
  const user = await User.findById("5c3f51664fc4d814e81f037c");
  // user ainda e um model do mongoose, logo teremos acesso a todos os metodos
  req.user = user;
  next();
});

// Setup das rotas.
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

process.on("uncaughtException", error => {
  console.log("Error", error);
  process.exit(1);
});

// Estabele conexao com banco, cria um user caso nao exista e inicia o server.
dataBaseConnection(async () => {
  const hasUser = await User.findOne();
  if (!hasUser) {
    // criando um user aleatorio
    const user = new User({
      username: "Cardeal",
      email: "test@email.com",
      password: "123",
      cart: { items: [] }
    });
    await user.save();
  }
  console.log("Connection to MongoDB stablished with success!");
  app.listen(PORT, () => {
    setTimeout(() => {
      // ativar o opn quando projeto estiver concluido.
      // opn(`http://localhost:${PORT}/`, { app: "firefox" });
    }, 1000);
    console.log(`Server On - PORT ${PORT}`);
  });
});
