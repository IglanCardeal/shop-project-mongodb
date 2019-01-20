const PORT = process.env.PORT || 3000;

const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dataBaseConnection = require(path.resolve("database", "connection"));
const helmet = require("helmet");

const User = require("./app/models/user");

app.set("view engine", "ejs");
app.set("views", "./app/views");

const adminRoutes = require("./app/routes/admin");
const shopRoutes = require("./app/routes/shop");
const errorController = require("./app/controllers/error-controller");

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "app", "public")));

app.use(async (req, res, next) => {
  const user = await User.findById("5c3f51664fc4d814e81f037c");
  // if (user === undefined) {
  //     const userData = {
  //         username: 'Cardeal',
  //         email: 'test@email.com',
  //         password: '123',
  //         cart: { items: [] }
  //     };
  //     const newUser = new User(userData);
  //     const result = await newUser.save();
  //     if (result === 'failed') {
  //         return errorController.errorHandler(res, 'Unable to create a new user!');
  //     }
  // }
  req.user = user; // user ainda e um model do mongoose, logo teremos acesso a todos os metodos
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

process.on("uncaughtException", error => {
  console.log("Error", error);
  process.exit(1);
});

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
  app.listen(PORT, () => console.log(`Server On - PORT ${PORT}`));
});
