const express = require("express");
const shopController = require("../controllers/shop-controller");
const router = express.Router();

// GET
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", shopController.getCart);
router.get("/orders", shopController.getOrders);

// POST
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);
router.post("/cart-control-quantity", shopController.postCartControlQuantity);
router.post("/create-order", shopController.postOrder);
router.post("/ajax-get-cart", shopController.ajaxGetCart);

module.exports = router;
