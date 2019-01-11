const PORT = process.env.PORT || 3000;

const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { dataBaseConnection } = require(path.resolve('database', 'connection'));
const helmet = require('helmet');

const User = require('./app/models/user');

app.set('view engine', 'ejs');
app.set('views', './app/views');

const adminRoutes = require('./app/routes/admin');
const shopRoutes = require('./app/routes/shop');
const errorController = require('./app/controllers/error');

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'app', 'public')));

// criando um user aleatorio e atribuindo ao req.user
app.use(async (req, res, next) => {
    await User.findUserById('5c33f845d44bb6f41bd9af6a')
        .then(user => {
            if (user == undefined) {
                const userData = {
                    username: 'Cardeal',
                    email: 'test@email.com',
                    password: '123',
                    cart: { items: [] }
                };
                const newUser = new User(userData);
                return newUser.save()
                    .then(result => {
                        if (result === 'success')
                            return ;
                    }).catch(e => console.log(e));
            }
            // console.log(user);
            req.user = new User(user); // user sera desestruturada no constructor
            next();
        })
        .catch(e => console.log(e));
    
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

process.on('uncaughtException', error => {
    console.log('Error', error);
    process.exit(1);
})

dataBaseConnection(() => {
    console.log('Connection to MongoDB stablished with success!');
    app.listen(PORT, () => console.log(`Server On - PORT ${PORT}`));
});