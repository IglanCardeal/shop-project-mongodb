/**
 * @csrfToken
 * Verifica e valida o token local com o token da requisicao.
 * Cada view renderizada que pode gerar efeitos colaterais, tera um
 * input com o token criado no server side. Quando o a requisicao for feita,
 * o token sera enviado e verificado no server side comparando o token que foi
 * enviado na renderizacao da pagina com o token local.
 */

module.exports = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
};
