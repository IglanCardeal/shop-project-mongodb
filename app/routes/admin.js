const express = require("express");
const adminController = require("../controllers/admin-controller");
const checkAuthentication = require("../../middleware/check-authentication");
const router = express.Router();

// Para as rotas de admin, ambas tem o prefixo '/admin' ajustado no app.use('/admin', adminRoutes)
// no arquivo App.js

// GET
router.get("/products", checkAuthentication, adminController.getProducts);
router.get("/add-product", checkAuthentication, adminController.getAddProduct);
router.get(
  "/edit-product/:productId",
  checkAuthentication,
  adminController.getEditProduct
);
router.get("/about-user", checkAuthentication, adminController.getUser);

// POST
router.post(
  "/add-product",
  checkAuthentication,
  adminController.postAddProduct
);
router.post(
  "/edit-product",
  checkAuthentication,
  adminController.postEditProduct
);
router.post(
  "/delete-product",
  checkAuthentication,
  adminController.postDeleteProduct
);
router.post("/postUserData", checkAuthentication, adminController.postUserData);

module.exports = router;
