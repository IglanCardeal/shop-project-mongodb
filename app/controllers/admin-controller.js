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
        try {
            const products = await Product.find({ userId: userId }).exec();
            return res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        } catch (error) {
            console.log('-----> Error: ', error);            
            return errorHandler(res, 'Unable to get admin products!');
        }
    };
    getProducts();
};

exports.postAddProduct = (req, res, next) => {
    const newBook = req.body;
    const userId = req.user._id;
    const product = new Product({
        title: newBook.title,
        price: newBook.price,
        description: newBook.description,
        imageUrl: newBook.imageUrl,
        userId: userId
    });
    const postAddProduct = async () => {
        try {
            await product.save().exec();
            return res.redirect('/admin/products');
        } catch (error) {
            console.log('product created!!!\n', result);
            return errorHandler(res, 'Unable to save the admin products!');
        }
    };
    postAddProduct();
};

exports.getEditProduct = (req, res, next) => {
    const { edit } = req.query;
    const { productId } = req.params;
    // const userId = req.user._id;
    if (!edit) {
        return res.redirect('/');
    }
    const getEditProduct = async () => {
        try {
            const product = await Product.findById(productId).exec();
            return res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: edit,
                product: product
            });
        } catch (error) {
            console.log('-----> Error: ', error);
            return errorHandler(res, 'Unable to get the product to edit');
        }
    };
    getEditProduct();
};

exports.postEditProduct = (req, res, next) => {
    const newBook = req.body;
    const userId = req.user._id;
    const postEditProduct = async () => {
        try {
            const product = await Product.findById(req.body.productId).exec();
            product.title = newBook.title;
            product.price = newBook.price;
            product.description = newBook.description;
            product.imageUrl = newBook.imageUrl;
            await product.save();
            return res.redirect('/admin/products');
        } catch (error) {
            console.log('-----> Error: ', error);
            return errorHandler(res, 'Unable to edit the product!');
        }
    };
    postEditProduct();
};

exports.postDeleteProduct = (req, res, next) => {
    const { productId } = req.body;
    const userId = req.user._id;
    const postDeleteProduct = async () => {
        try {
            await Product.findByIdAndRemove('5c3e876a20f74232a01fcf0b').exec();
            return res.redirect('/admin/products');
        } catch (error) {
            console.log('-----> Error: ', error);
            return errorHandler(res, 'Unable to delete the product!');
        }
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
