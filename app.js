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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'app', 'public')));

app.use((req, res, next) => {
  User.findUserById('5c2a7ae8322d583394548a4c')
    .then(user => {
      if (user) {
        req.user = user;
        return next();
      }
      const userData = {
        username: 'Cardeal',
        email: 'test@email.com',
        password: '123'
      };
      const newUser = new User(userData);
      newUser.save()
        .then(result => {
          if (result === 'success')
            return next();
        });
    })
    .catch(e => console.log(e));
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


dataBaseConnection(() => {
  console.log('Connection to MongoDB stablished with success!');
  app.listen(PORT, () => console.log(`Server On - PORT ${PORT}`));
});