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

router.get("/order/:orderId", checkAuthentication, shopController.getInvoice);

router.get("/checkout", checkAuthentication, shopController.getCheckout);
/*
Quando usar o Stripe para pagamentos.
router.get("/checkout/success", checkAuthentication, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", checkAuthentication, shopController.getCheckout);
*/

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

router.post("/order", checkAuthentication, shopController.postOrder);

router.post("/ajax-get-cart", checkAuthentication, shopController.ajaxGetCart);

module.exports = router;
