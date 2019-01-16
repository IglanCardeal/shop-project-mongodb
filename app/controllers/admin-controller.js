const Product = require('../models/product');
const { errorHandler } = require('./error-controller');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.getProducts = (req, res, next) => {
    const userId = req.user._id;
    const getProducts = async () => {
        const products = await Product.fetchAllProducts(userId);
        if (products === 'failed') {
            return errorHandler(res, 'Unable to get admin products!');
        }
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    };
    getProducts();
};

exports.postAddProduct = (req, res, next) => {
    const newBook = req.body;
    const userId = req.user._id;
    const product = new Product(newBook, userId);
    const postAddProduct = async () => {
        const result = await product.save();
        if (result === 'failed') {
            return errorHandler(res, 'Unable to save the admin product!');
        }
        res.redirect('/admin/products');
    };
    postAddProduct();
};

exports.getEditProduct = (req, res, next) => {
    const { edit } = req.query;
    const { productId } = req.params;
    const userId = req.user._id;
    if (!edit) {
        return res.redirect('/');
    }
    const getEditProduct = async () => {
        const product = await Product.findProductById(productId, userId);
        if (product === 'failed') {
            return errorHandler(res, 'Unable to get the product to edit!');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: edit,
            product: product
        });
    };
    getEditProduct();
};

exports.postEditProduct = (req, res, next) => {
    const bookData = req.body;
    const userId = req.user._id;
    const updatedBook = new Product(bookData, userId);
    const postEditProduct = async () => {
        const result = await updatedBook.save();
        if (result === 'failed') {
            return errorHandler(res, 'Unable to edit the product!');
        }
        res.redirect('/admin/products');
    };
    postEditProduct();
};

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    const userId = req.user._id;
    const postDeleteProduct = async () => {
        const result = await Product.deleteProductById(productId, userId);
        if (result === 'failed') {
            return errorHandler(res, 'Unable to delete the product!');
        }
        res.redirect('/admin/products');
    };
    postDeleteProduct();
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
