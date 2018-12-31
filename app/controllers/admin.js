const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAllProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const newBook = req.body;
  const product = new Product(newBook);
  product
    .save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const { edit } = req.query;
  const { productId } = req.params;
  if (!edit) {
    return res.redirect('/');
  }
  Product.findProductById(productId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: edit,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const bookData = req.body;
  const updatedBook = new Product(bookData);
  updatedBook.save()
    .then(result => {
      if (result === 'success')
        return res.redirect('/admin/products');
      res.send('Nao foi possivel editar o produto!');
    })
    .catch(e => console.log(e));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.deleteProductById(productId)
    .then(result => {
      if (result)
        return res.redirect('/admin/products');
      res.send('Nao foi possivel remover o produto!');
    })
    .catch(err => console.log(err));
};

exports.postUserData = (req, res, next) => {
  const { username, email } = req.user;
  const userData = { 
    username: username, 
    email: email 
  };
  res.send(JSON.stringify(userData));
};
