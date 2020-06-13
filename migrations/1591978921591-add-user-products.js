const connection = require('../database/migration-connection');

connection();

const User = require('../src/app/models/user');
const Product = require('../src/app/models/product');

const userData = {
  username: 'Teste',
  email: 'teste@email.com',
  password: '123',
};

async function up() {
  const user = await User.create(userData);

  // urls para imagen ja salvas na pasta upload
  const urls = [
    'uploads/public/users/2020/jun/test.jpg',
    'uploads/public/users/2020/jun/test.png',
    'uploads/public/users/2020/jun/test2.jpg',
    'uploads/public/users/2020/jun/test3.jpg',
    'uploads/public/users/2020/jun/test4.jpg',
    'uploads/public/users/2020/jun/test5.jpg',
    'uploads/public/users/2020/jun/test6.jpg',
    'uploads/public/users/2020/jun/test7.jpg',
  ];


  for (const [idx, url] of urls.entries()) {
    const todo =
      await Product.create({
        title: `Test Book`,
        price: 10 + ((idx + 1) * 10 - 5),
        description: 'Test description.',
        imageUrl: url,
        userId: user._id
      });
  }
}

async function down() {
  await User.deleteOne({ email: userData.email });
  await Product.deleteMany({ description: 'Test description.' });
}

module.exports = { up, down };
