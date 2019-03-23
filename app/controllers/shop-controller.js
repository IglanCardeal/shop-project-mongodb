/**
 * @productsshow
 * Controller para exibicao de produtos, detalhes de produtos, carrinhos de compras
 *  e ordem de compra.
 * @catchServerErrorFunction funcao que executa tratamento de erros.
 */

const Product = require("../models/product");
const Order = require("../models/order");

/**
 * catchServerErrorFunction recebe:
 * objeto de error.
 * httpStatusCode.
 * msg de erro, verificacao se chamada e um ajax.
 * next.
 * catchServerErrorFunction( @object , @number , @string , @boolean , @next )
 */
const { catchServerErrorFunction } = require("./error-controller");

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("-userId")
      .exec();
    return res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to list products!",
      false,
      next
    );
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("-userId")
      .exec();
    return res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to list products!",
      false,
      next
    );
  }
};

exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId)
      .select("-userId")
      .exec();
    return res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get the product!",
      false,
      next
    );
  }
};

exports.getCart = (req, res, next) => {
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart"
  });
};

exports.ajaxGetCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    const jsonData = getDataFromCart(products);
    return res.send(JSON.stringify(jsonData));
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get the products in cart!",
      true,
      next
    );
  }
};

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await req.user.addProductToCart(productId);
    return res.redirect("/cart");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to add a product to cart!",
      false,
      next
    );
  }
};

exports.postCartControlQuantity = async (req, res, next) => {
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
    return catchServerErrorFunction(
      error,
      500,
      "Unable to control the products in cart!",
      true,
      next
    );
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    await req.user.removeProductFromCart(req.body.productId);
    return res.redirect("/cart");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to delete the product from cart!",
      false,
      next
    );
  }
};

exports.getOrders = async (req, res, next) => {
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
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get orders!",
      false,
      next
    );
  }
};

exports.postOrder = async (req, res, next) => {
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
    return catchServerErrorFunction(
      error,
      500,
      "Unable to add new orders!",
      false,
      next
    );
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
      // '._doc' extrai todos os dados do documento relacionado.
      product: { ...item.productId._doc },
      quantity: item.quantity
    };
  });

  return { cartProducts, totalPrice };
};
