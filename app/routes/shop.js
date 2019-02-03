const express = require("express");
const shopController = require("../controllers/shop-controller");
const checkAuthentication = require("../../middleware/check-authentication");
const router = express.Router();

// GET
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", checkAuthentication, shopController.getCart);
router.get("/orders", checkAuthentication, shopController.getOrders);

// POST
router.post("/cart", checkAuthentication, shopController.postCart);
router.post(
  "/cart-delete-item",
  checkAuthentication,
  shopController.postCartDeleteProduct
);
router.post(
  "/cart-control-quantity",
  checkAuthentication,
  shopController.postCartControlQuantity
);
router.post("/create-order", checkAuthentication, shopController.postOrder);
router.post("/ajax-get-cart", checkAuthentication, shopController.ajaxGetCart);

module.exports = router;
