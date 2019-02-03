module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      isAuthenticated: false,
      error: "You have to login first!"
    });
  }
  next();
};
