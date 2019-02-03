const Product = require("../models/product");
const Order = require("../models/order");
const { errorHandler } = require("./error-controller");

exports.getIndex = (req, res, next) => {
  const getIndex = async () => {
    try {
      const products = await Product.find().exec();
      return res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to list products!");
    }
  };
  getIndex();
};

exports.getProducts = (req, res, next) => {
  const getProducts = async () => {
    try {
      const products = await Product.find().exec();
      return res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to list products!");
    }
  };
  getProducts();
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  const getProduct = async () => {
    try {
      const product = await Product.findById(productId).exec();
      return res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to get the product!");
    }
  };
  getProduct();
};

exports.getCart = (req, res, next) => {
  return res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.ajaxGetCart = (req, res, next) => {
  const ajaxGetCart = async () => {
    try {
      const user = await req.user
        .populate("cart.items.productId")
        .execPopulate();
      const products = user.cart.items;
      const productsData = [];
      const idsArray = [];
      let totalPrice = 0;
      products.forEach(order => {
        totalPrice += order.quantity * order.productId.price;
        idsArray.push(order.productId._id);
        productsData.push({
          data: order.productId,
          quantity: order.quantity
        });
      });
      const jsonData = {
        idsArray: idsArray,
        productsData: productsData,
        totalPrice: totalPrice
      };
      return res.send(JSON.stringify(jsonData));
    } catch (error) {
      console.log("-----> Error: ", error);
      return res.status(500).json({
        title: "Server Error",
        msg: "Unable to get the products in cart!",
        status: "500 - internal server error!"
      });
    }
  };
  ajaxGetCart();
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  const postCart = async () => {
    try {
      await req.user.addProductToCart(productId);
      return res.redirect("/cart");
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to add a product to cart!");
    }
  };
  postCart();
};

exports.postCartControlQuantity = (req, res, next) => {
  const postCartControlQuantity = async () => {
    try {
      const { action, productId } = req.body;
      if (action === "increase" || action === "decrease") {
        await req.user.addProductToCart(productId, action);
      }
      if (action === "delete") {
        await req.user.removeProductFromCart(productId);
      }
      return res.status(200).json();
    } catch (error) {
      console.log("-----> Error: ", error);
      return res.status(500).json({
        title: "Server Error",
        msg: "Unable to get the products in cart!",
        status: "500 - internal server error!"
      });
    }
  };
  postCartControlQuantity();
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  const postCartDeleteProduct = async () => {
    try {
      await req.user.removeProductFromCart(productId);
      return res.redirect("/cart");
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to delete the product from cart!");
    }
  };
  postCartDeleteProduct();
};

exports.postOrder = (req, res, next) => {
  const postOrder = async () => {
    try {
      const user = await req.user
        .populate("cart.items.productId")
        .execPopulate();
      let totalPrice = 0;
      const cartProducts = user.cart.items.map(item => {
        totalPrice += item.productId._doc.price * item.quantity;
        return {
          product: { ...item.productId._doc }, // extrai todos os dados do documento para este novo objeto
          quantity: item.quantity
        };
      });
      const order = new Order({
        user: {
          username: req.user.username,
          userId: req.user._id
        },
        totalPrice: totalPrice,
        products: cartProducts
      });
      await order.save();
      await req.user.clearCart();
      return res.redirect("/orders");
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to add orders!");
    }
  };
  postOrder();
};

exports.getOrders = (req, res, next) => {
  const getOrders = async () => {
    try {
      const userOrders = await Order.find({
        "user.userId": req.user._id
      }).exec();
      return res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: userOrders,
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to get orders!");
    }
  };
  getOrders();
};
