const express = require("express");
const authController = require("../controllers/auth-controller");
const Router = express.Router();

Router.get("/login", authController.getLogin);
Router.get("/signup", authController.getSignup);
Router.post("/login", authController.postLogin);
Router.post("/logout", authController.postLogout);
Router.post("/signup", authController.postSignup);

module.exports = Router;
