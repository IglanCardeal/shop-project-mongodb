/* eslint-disable no-unused-vars */

/**
 * O status code, msg e estado da autenticacao devem ser informados no objeto 'error'
 * nas chamada da funcao de tratamento 'serverErrorFunction', nos arquivos de
 * controllers.
 */

const { join } = require('path');
const generateLogErrors = require('../errors/errors-log-handler');

module.exports = (error, req, res, next) => {
  const message = error.errorMsg;

  const filepath = join(__dirname, '../logs/errors.log');

  console.log(filepath);

  generateLogErrors(error, filepath, error.statusCode);

  /**
   * REMOVER ESTE CODIGO PARA ERROS DE CHAMADAS AJAX.
   */
  if (error.isAjax) {
    return res.status(error.httpStatusCode).json({
      title: 'Server Error',
      msg: message,
      status: '500 - internal server error!',
    });
  }
  // ===============================================

  return res.status(error.httpStatusCode).render('404', {
    pageTitle: 'Server Error',
    path: '',
    msg: message,
    status: '500 - internal server error!',
    isAuthenticated: req.session.isLoggedIn,
  });
};
