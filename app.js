const path = require('path');
const PORT = process.env.PORT || 3000;

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./app/controllers/error');
// const mongoose = require('mongoose');
const User = require('./app/models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./app/routes/admin');
const shopRoutes = require('./app/routes/shop');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  // User.findById('5baa2528563f16379fc8a610')
  //   .then(user => {
  //     req.user = new User(user.name, user.email, user.cart, user._id);
  //     next();
  //   })
  //   .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(PORT, () => console.log(`Server On - PORT ${PORT}`))

// mongoose.connect('mongodb://localhost:27017')
//   .then(() => app.listen(PORT, () => console.log(`Server On - PORT ${PORT}`)))
//   .catch(e => console.log(e));
