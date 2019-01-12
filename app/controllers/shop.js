const Product = require('../models/product');

const errorHandler = (res, msg) => {
    res.status(500);
    return res.render('404', { 
        pageTitle: 'Page Not Found', 
        path: '404',
        msg,
        status: '500 - internal server error!'
     });
};

exports.getIndex = (req, res, next) => {
    const getIndex = async () => {
        const listOfProducts = await Product.fetchAllProducts();
        if (listOfProducts === 'failed') {
            return errorHandler(res, 'Unable to list products!');
        }
        res.render('shop/index', {
            prods: listOfProducts,
            pageTitle: 'Shop',
            path: '/'
        });
    };
    getIndex();
};

exports.getProducts = (req, res, next) => {
    const getProducts = async () => {
        const listOfProducts = await Product.fetchAllProducts();
        if (listOfProducts === 'failed') {
            return errorHandler(res, 'Unable to list products!');
        }
        res.render('shop/product-list', {
            prods: listOfProducts,
            pageTitle: 'All Products',
            path: '/products'
        });
    };
    getProducts();
};

exports.getProduct = (req, res, next) => {
    const { productId } = req.params;
    const getProduct = async () => {
        const product = await Product.findProductById(productId);
        if (product === 'failed') {
            return errorHandler(res, 'Unable to get the product!');
        }
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    };
    getProduct();
};

exports.getCart = (req, res, next) => {
    const getCart = async () => {
        const products = await req.user.getCartProducts();
        if (products === 'failed') {
            return errorHandler(res, 'Unable to get the user cart!');
        }
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
        });
    };
    getCart();
};

exports.postCart = (req, res, next) => {
    const { productId } = req.body;
    const postCart = async () => {
        const result = await req.user.addProductToCart(productId);
        if (result === 'failed') {
            return errorHandler(res, 'Unable to add a product to cart!');
        }
        return res.redirect('/cart');
    };
    postCart();
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    const removeProduct = async () => {
        const result = await req.user.removeProductFromCart(productId);
        if (result === 'failed') {
            return errorHandler(res, 'Unable to delete a product from cart!');
        }
        res.redirect('/cart');
    };
    removeProduct();
};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    // req.user
    //   .addOrder()
    //   .then(result => {
    //     res.redirect('/orders');
    //   })
    //   .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    // req.user
    //   .getOrders()
    //   .then(orders => {
    //     res.render('shop/orders', {
    //       path: '/orders',
    //       pageTitle: 'Your Orders',
    //       orders: orders
    //     });
    //   })
    //   .catch(err => console.log(err));
};
