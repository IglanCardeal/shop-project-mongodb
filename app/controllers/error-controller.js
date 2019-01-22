// **************************************
// Metodos para tratamento de erros de
// 404 - not found e erros de servidor
// **************************************

exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    msg: "Unable to find the page",
    status: "404 - not found!"
  });
};

exports.errorHandler = (res, msg) => {
  res.status(500);
  return res.render("404", {
    pageTitle: "Server Error",
    path: "",
    msg,
    status: "500 - internal server error!"
  });
};
