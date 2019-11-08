/**
 * @errorhandler middleware para tratamento de erros de servidor.
 * @params recebe ojbeto de erro com mensagem de erro, Http Status Code
 * O status code, msg e estado da autenticacao devem ser informados no objeto 'error'
 * nas chamada da funcao de tratamento 'serverErrorFunction', nos arquivos de
 * controllers.
 */

module.exports = (error, req, res, next) => {
  console.log("Caught Server Error: \n" + error);
  const message = error.errorMsg;
  if (error.isAjax) {
    return res.status(error.httpStatusCode).json({
      title: "Server Error",
      msg: message,
      status: "500 - internal server error!"
    });
  }
  return res.status(error.httpStatusCode).render("404", {
    pageTitle: "Server Error",
    path: "",
    msg: message,
    status: "500 - internal server error!",
    isAuthenticated: req.session.isLoggedIn
  });
};
