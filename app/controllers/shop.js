const Product = require('../models/product');
const User = require('../models/user');

exports.getIndex = (req, res, next) => {
    Product.fetchAllProducts()
        .then(products => {
            // console.log(products);
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAllProducts()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getProduct = (req, res, next) => {
    const { productId } = req.params;
    Product.findProductById(productId)
        .then(product => {
            // console.log(product);
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user.getCartProducts()
        .then(products => {
            // console.log(products);
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(e => console.log(e));
};

exports.postCart = (req, res, next) => {
    const { productId } = req.body;
    req.user.addProductToCart(productId)
        .then(result => {
            if (result === 'success') return res.redirect('/cart'); 
            res.redirect('/error', {}); // page a ser criada caso algum erro ocorra
        })
        .catch(e => console.log(e));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    const removeProduct = async () => {
        const result = await req.user.removeProductFromCart(productId);
        if (result === 'success') return res.redirect('/cart');
        return res.redirect('/error', {});
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
