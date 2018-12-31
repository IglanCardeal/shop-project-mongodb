const path = require('path');
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { dataBaseConnection } = require(path.resolve('database', 'connection'));
const User = require('./app/models/user');

app.set('view engine', 'ejs');
app.set('views', './app/views');

const adminRoutes = require('./app/routes/admin');
const shopRoutes = require('./app/routes/shop');
const errorController = require('./app/controllers/error');

app.use((req, res, next) => {
  // aqui definimos um user para a requisicao
  next();
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'app', 'public')));
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

dataBaseConnection(() => {
  console.log('Connection to MongoDB stablished with success!');
  app.listen(PORT, () => console.log(`Server On - PORT ${PORT}`));
});
