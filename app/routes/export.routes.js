const routes = require("express").Router();

const adminRoutes = require("./admin");
const shopRoutes = require("./shop");
const authRoutes = require("./auth");

routes.use("/admin", adminRoutes);
routes.use(shopRoutes);
routes.use(authRoutes);

module.exports = routes;
