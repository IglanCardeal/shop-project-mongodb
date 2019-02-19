module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash("error", "You have to login first!");
    return res.redirect("/login");
  }
  next();
};
