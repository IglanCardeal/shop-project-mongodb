module.exports = (req, res, next) => {
  // Evita a rota de login se ja estiver logado.
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
};
