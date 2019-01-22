const express = require("express");
const adminController = require("../controllers/admin-controller");
const router = express.Router();

// Para as rotas de admin, ambas tem o prefixo '/admin' ajustado no app.use('/admin', adminRoutes)
// no arquivo App.js

// GET
router.get("/products", adminController.getProducts);
router.get("/add-product", adminController.getAddProduct);
router.get("/edit-product/:productId", adminController.getEditProduct);

// POST
router.post("/add-product", adminController.postAddProduct);
router.post("/edit-product", adminController.postEditProduct);
router.post("/delete-product", adminController.postDeleteProduct);
router.post("/postUserData", adminController.postUserData);

module.exports = router;
