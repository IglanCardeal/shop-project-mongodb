const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.getProducts = (req, res, next) => {
    const userId = req.user._id;
    Product.fetchAllProducts(userId)
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
    const userId = req.user._id;
    const product = new Product(newBook, userId);
    console.log(userId)
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
    const userId = req.user._id;
    if (!edit) {
        return res.redirect('/');
    }
    Product.findProductById(productId, userId)
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
    const userId = req.user._id;
    const updatedBook = new Product(bookData, userId);
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
    const userId = req.user._id;
    Product.deleteProductById(productId, userId)
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
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(userData));
};
