const express = require('express');
const { body } = require('express-validator/check');
const adminController = require('../controllers/admin-controller');
const checkAuthentication = require('../../middleware/check-authentication');
const adminValidator = require('./validators/admin-validator');

const router = express.Router();

// GET
router.get('/products', checkAuthentication, adminController.getProducts);

router.get('/add-product', checkAuthentication, adminController.getAddProduct);

router.get(
  '/edit-product/:productId',
  checkAuthentication,
  adminController.getEditProduct
);

router.get('/about-user', checkAuthentication, adminController.getUser);

// POST
router.post(
  '/add-product',
  checkAuthentication,
  adminValidator.addAndEditProductValidator(body),
  adminController.postAddProduct
);

router.post(
  '/edit-product',
  checkAuthentication,
  adminValidator.addAndEditProductValidator(body),
  adminController.postEditProduct
);

// router.post(
//   "/delete-product",
//   checkAuthentication,
//   adminController.postDeleteProduct
// );

router.post('/postUserData', checkAuthentication, adminController.postUserData);

// DELETE
router.post(
  '/delete-product',
  checkAuthentication,
  adminController.deleteProduct
);

module.exports = router;
