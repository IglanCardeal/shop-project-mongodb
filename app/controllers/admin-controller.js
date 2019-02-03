const Product = require("../models/product");
const { errorHandler } = require("./error-controller");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.getProducts = (req, res, next) => {
  const userId = req.session.userId;
  const getProducts = async () => {
    try {
      const products = await Product.find({ userId: userId }).exec();
      return res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to get admin products!", req);
    }
  };
  getProducts();
};

exports.postAddProduct = (req, res, next) => {
  const newBook = req.body;
  const userId = req.session.userId;
  const product = new Product({
    title: newBook.title,
    price: newBook.price,
    description: newBook.description,
    imageUrl: newBook.imageUrl,
    userId: userId
  });
  const postAddProduct = async () => {
    try {
      await product.save();
      return res.redirect("/admin/products");
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to save the admin products!", req);
    }
  };
  postAddProduct();
};

exports.getEditProduct = (req, res, next) => {
  const { edit } = req.query;
  const { productId } = req.params;
  // const userId = req.session.user._id;
  if (!edit) {
    return res.redirect("/");
  }
  const getEditProduct = async () => {
    try {
      const product = await Product.findById(productId).exec();
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: edit,
        product: product,
        isAuthenticated: req.session.isLoggedIn
      });
    } catch (error) {
      console.log("-----> Error: ", error);
      return errorHandler(res, "Unable to get the product to edit", req);
    }
  };
  getEditProduct();
};

// O product a ser editado, deve ser filtrado pelo id do user.
exports.postEditProduct = (req, res, next) => {
  const newBook = req.body;
  const userId = req.session.userId;
  const postEditProduct = async () => {
    try {
      const product = await Product.findById(req.body.productId).exec();
      const productBelongsToUser = Boolean(
        product.userId.toString() === userId.toString()
      );
      if (!productBelongsToUser) return res.redirect("/admin/products");
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
  postEditProduct();
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  const userId = req.session.userId;
  const postDeleteProduct = async () => {
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
  postDeleteProduct();
};

// Sobre o admin-user, adicionar funcionalidade de editar email, nome e redefinir senha.
exports.getUser = (req, res, next) => {
  const userData = req.user;
  const qtyInCart = req.user.cart.items.length;
  let productsInCart = "";
  if (qtyInCart === 0) productsInCart = `No products in cart.`;
  productsInCart = `${qtyInCart} products on cart.`;
  res.render("admin/about-user", {
    pageTitle: "Your Data",
    path: "/user",
    editing: false,
    userData: userData,
    productsInCart: productsInCart,
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postUserData = (req, res, next) => {
  const postUserData = async () => {
    try {
      const { username, email } = req.user;
      const userData = {
        username: username,
        email: email
      };
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(userData));
    } catch (error) {}
  };
  postUserData();
};
