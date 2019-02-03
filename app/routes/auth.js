const express = require("express");
const authController = require("../controllers/auth-controller");
const checkIfIsLoggedIn = require("../../middleware/check-logged-status");
const Router = express.Router();

Router.get("/login", checkIfIsLoggedIn, authController.getLogin);
Router.get("/signup", checkIfIsLoggedIn, authController.getSignup);
Router.post("/login", checkIfIsLoggedIn, authController.postLogin);
Router.post("/logout", authController.postLogout);
Router.post("/signup", checkIfIsLoggedIn, authController.postSignup);

module.exports = Router;
