/**
 * Apenas evita a rota de login se ja estiver logado.
 */

module.exports = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/')
  }

  return next()
}
