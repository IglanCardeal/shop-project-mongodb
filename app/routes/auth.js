const express = require("express");
const authController = require("../controllers/auth-controller");
const checkIfIsLoggedIn = require("../../middleware/check-logged-status");
const Router = express.Router();

const { check, body } = require("express-validator/check");
const authValidator = require("./validators/auth-validator");

Router.get("/login", checkIfIsLoggedIn, authController.getLogin);
Router.get("/signup", checkIfIsLoggedIn, authController.getSignup);
Router.get("/reset-password", authController.getReset);
Router.get("/reset/:token", authController.getResetToken);
Router.post("/login", checkIfIsLoggedIn, authController.postLogin);
Router.post("/logout", authController.postLogout);
Router.post(
  "/signup",
  checkIfIsLoggedIn,
  authValidator(check, body),
  authController.postSignup
);
Router.post("/reset-password", authController.postReset);
Router.post("/set-new-password", authController.postSetNewPassword);

module.exports = Router;
