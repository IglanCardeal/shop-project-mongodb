const Product = require("../models/product");
const Order = require("../models/order");
const { errorHandler } = require("./error-controller");

exports.getIndex = async (req, res) => {
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

exports.getProducts = async (req, res) => {
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

exports.getProduct = async (req, res) => {
  const { productId } = req.params;
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

exports.getCart = (req, res) => {
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart"
  });
};

exports.ajaxGetCart = async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    const jsonData = getDataFromCart(products);
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

exports.postCart = async (req, res) => {
  const { productId } = req.body;
  try {
    await req.user.addProductToCart(productId);
    return res.redirect("/cart");
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to add a product to cart!");
  }
};

exports.postCartControlQuantity = async (req, res) => {
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
      msg: "Unable to control the products in cart!",
      status: "500 - internal server error!"
    });
  }
};

exports.postCartDeleteProduct = async (req, res) => {
  try {
    await req.user.removeProductFromCart(req.body.productId);
    return res.redirect("/cart");
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to delete the product from cart!");
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userOrders = await Order.find({
      "user.userId": req.user._id
    }).exec();
    return res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: userOrders
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to get orders!");
  }
};

exports.postOrder = async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id
      },
      totalPrice: getProductsToOrder(user).totalPrice,
      products: getProductsToOrder(user).cartProducts
    });
    await order.save();
    await req.user.clearCart();
    return res.redirect("/orders");
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to add orders!");
  }
};

const getDataFromCart = products => {
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
  return {
    idsArray: idsArray,
    productsData: productsData,
    totalPrice: totalPrice
  };
};

const getProductsToOrder = user => {
  let totalPrice = 0;
  let cartProducts = user.cart.items.map(item => {
    totalPrice += item.productId._doc.price * item.quantity;
    return {
      product: { ...item.productId._doc }, // extrai todos os dados do documento relacionado para este novo objeto
      quantity: item.quantity
    };
  });

  return { cartProducts, totalPrice };
};
