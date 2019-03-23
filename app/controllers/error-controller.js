/**
 * @get404 page not found handler. Caso de url invalida ou nao encontrada.
 */

exports.get404 = (req, res, next) => {
  return res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    msg: "Unable to find the page",
    status: "404 - not found!",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.errorHandler = (res, msg, req = { session: {} }) => {
  return res.status(500).render("404", {
    pageTitle: "Server Error",
    path: "",
    msg,
    status: "500 - internal server error!",
    isAuthenticated: req.session.isLoggedIn
  });
};

/**
 * @serverErrorFunction para execucao de tratamento de erro de servidor.
 * @error capturado pelo bloco 'try'.
 * @status codigo de servidor.
 * @msg relativa a tentativa de execucao.
 * @isAjax informa se a acao esta relacionada com uma chamada ajax do front-end.
 * @next funcao do framework express.
 */

exports.catchServerErrorFunction = (
  errorCatched,
  status,
  msg,
  isAjax = false,
  next
) => {
  const error = new Error(`
    Internal Server Error! 
    ${errorCatched}
  `);
  error.httpStatusCode = status;
  error.errorMsg = msg;
  error.isAjax = isAjax;
  return next(error);
};
