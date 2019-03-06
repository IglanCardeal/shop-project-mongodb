/**
 * @errorhandler
 * Controller para tratamento de erros de servidor (404  & 500)
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
