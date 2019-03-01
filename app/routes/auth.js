const express = require("express");
const authController = require("../controllers/auth-controller");
const checkIfIsLoggedIn = require("../../middleware/check-logged-status");
const Router = express.Router();

Router.get("/login", checkIfIsLoggedIn, authController.getLogin);
Router.get("/signup", checkIfIsLoggedIn, authController.getSignup);
Router.get("/reset-password", authController.getReset);
Router.get("/reset/:token", authController.getResetToken);
Router.post("/login", checkIfIsLoggedIn, authController.postLogin);
Router.post("/logout", authController.postLogout);
Router.post("/reset-password", authController.postReset);
Router.post("/set-new-password", authController.postSetNewPassword);
Router.post("/signup", checkIfIsLoggedIn, authController.postSignup);

module.exports = Router;
