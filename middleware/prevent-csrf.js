module.exports = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
};

/* 
  (req, res, next) => {
  // res.locals permite atribuir propriedades que serao passadas para todas as views
  // que forem renderizadas.
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(); // metodo que procura pelo valor do input de name="_csrf" para comparar com o token no server-side.
  next();
 */
