const Product = require("../models/product");
const { errorHandler } = require("./error-controller");

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.getProducts = async (req, res) => {
  const userId = req.session.userId;
  try {
    const products = await Product.find({ userId: userId }).exec();
    return res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      error: req.flash("error")
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to get admin products!", req);
  }
};

exports.postAddProduct = async (req, res) => {
  const newBook = req.body;
  const userId = req.session.userId;
  const product = new Product({
    title: newBook.title,
    price: newBook.price,
    description: newBook.description,
    imageUrl: newBook.imageUrl,
    userId: userId
  });
  try {
    await product.save();
    return res.redirect("/admin/products");
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to save the admin products!", req);
  }
};

exports.getEditProduct = async (req, res) => {
  const { edit } = req.query;
  const { productId } = req.params;
  // const userId = req.session.user._id;
  if (!edit) {
    return res.redirect("/");
  }
  try {
    const product = await Product.findById(productId).exec();
    return res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: edit,
      product: product
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to get the product to edit", req);
  }
};

// O product a ser editado, deve ser filtrado pelo id do user.
exports.postEditProduct = async (req, res) => {
  const newBook = req.body;
  const userId = req.session.userId;
  try {
    const product = await Product.findById(req.body.productId).exec();
    const productBelongsToUser = Boolean(
      product.userId.toString() === userId.toString()
    );
    if (!productBelongsToUser) {
      req.flash("error", "The product do not belongs to you!");
      return res.redirect("/admin/products");
    }
    product.title = newBook.title;
    product.price = newBook.price;
    product.description = newBook.description;
    product.imageUrl = newBook.imageUrl;
    await product.save();
    return res.redirect("/admin/products");
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to edit the product!", req);
  }
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.userId;
  try {
    await Product.findOneAndDelete({
      _id: productId,
      userId: userId
    }).exec();
    return res.redirect("/admin/products");
  } catch (error) {
    console.log("-----> Error: ", error);
    return errorHandler(res, "Unable to delete the product!", req);
  }
};

// Sobre o admin-user, adicionar funcionalidade de editar email, nome e redefinir senha.
exports.getUser = (req, res) => {
  const { username, email, cart } = req.user;
  const qtyInCart = cart.items.length;
  let productsInCart = "";
  if (qtyInCart === 0) productsInCart = `No products in cart.`;
  productsInCart = `${qtyInCart} products on cart.`;
  res.render("admin/about-user", {
    pageTitle: "Your Data",
    path: "/user",
    editing: false,
    userData: { username, email },
    productsInCart: productsInCart
  });
};

exports.postUserData = async (req, res) => {
  try {
    const { username } = req.user;
    const userData = {
      username: username
    };
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(userData));
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      title: "Server Error",
      msg: "Unable to get user data!",
      status: "500 - internal server error!"
    });
  }
};
