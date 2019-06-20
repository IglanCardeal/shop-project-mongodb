/**
 * @admincontrols
 * Controle de usuarios cadastrados para editar, adicionar e excluir produtos
 * e controle de dados da conta.
 */

const Product = require("../models/product");
const { validationResult } = require("express-validator/check");
const fs = require('fs')

/**
 * catchServerErrorFunction recebe:
 * objeto de error.
 * httpStatusCode.
 * msg de erro, verificacao se chamada e um ajax.
 * next.
 * catchServerErrorFunction( @object , @number , @string , @boolean , @next )
 */
const { catchServerErrorFunction } = require("./error-controller");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    title: "",
    price: 0.0,
    imageUrl: "",
    description: "",
    productId: null,
    error: ""
  });
};

exports.getProducts = async (req, res, next) => {
  const userId = req.user._id;
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
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get admin products!",
      false,
      next
    );
  }
};

exports.postAddProduct = async (req, res, next) => {
  const newBook = req.body;
  const userId = req.user._id;
  const image = req.file;
  const postAddError = (res, title, price, description, errorMsg) => {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      title: title,
      price: price,
      description: description,
      productId: null,
      error: errorMsg
    });
  };
  let errors = validationResult(req);
  if (!image) {
    return postAddError(
      res,
      newBook.title,
      newBook.price,
      newBook.description,
      "No image file was attached! Please insert some image of the product."
    );
  }

  if (!errors.isEmpty()) {
    return postAddError(
      res,
      newBook.title,
      newBook.price,
      newBook.description,
      errors.array()[0].msg
    );
  }
  const product = new Product({
    title: newBook.title,
    price: newBook.price,
    description: newBook.description,
    imageUrl: image.path,
    userId: userId
  });
  try {
    await product.save();
    return res.redirect("/admin/products");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to save the admin products!",
      false,
      next
    );
  }
};

exports.getEditProduct = async (req, res, next) => {
  const { edit } = req.query;
  const { productId } = req.params;
  const userId = req.user._id;
  if (!edit) {
    return res.redirect("/");
  }
  try {
    const product = await Product.findOne({
      _id: productId,
      userId: userId
    }).exec();
    return res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: edit,
      product: product,
      error: null
    });
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to get the product to edit",
      false,
      next
    );
  }
};

exports.postEditProduct = async (req, res, next) => {
  const newBook = req.body;
  const userId = req.user._id;
  const image = req.file;
  const { productId } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      product: {
        title: newBook.title,
        price: newBook.price,
        description: newBook.description,
        _id: productId
      },
      error: errors.array()[0].msg,
      editing: true
    });
  }
  try {
    const product = await Product.findOne({
      _id: productId,
      userId: userId
    }).exec();
    if (!product) {
      req.flash("error", "The product do not belongs to your account!");
      return res.redirect("/admin/products");
    }
    product.title = newBook.title;
    product.price = newBook.price;
    product.description = newBook.description;
    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    return res.redirect("/admin/products");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to edit the product!",
      false,
      next
    );
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;
  try {
    const product = await Product.findById(productId);
    deleteFile(product.imageUrl);
    await Product.findOneAndDelete({
      _id: productId,
      userId: userId
    }).exec();
    return res.redirect("/admin/products");
  } catch (error) {
    console.log("-----> Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to delete the product!",
      false,
      next
    );
  }
};

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
  const userData = { username: req.user.username };
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(userData));
};

const deleteFile = async filePath => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, err => {
      if (err) reject(err);
    });
  })
};
