/**
 * Se o usuario nao estiver autenticado, sera redirecionado para pagina de login.
 */

module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash('error', 'You have to login first!')

    return res.redirect('/login')
  }

  return next()
}
