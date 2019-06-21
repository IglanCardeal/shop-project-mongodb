const User = require("../app/models/user");

module.exports = async (req, res, next) => {
  if (!req.session.userId) return next();
  try {
    const user = await User.findById(req.session.userId);
    // if (!user) return res.redirect("/login"); // quando id de sessao nao existir ou invalido.
    if (!user)
      return next();
    req.user = user;
    return next();
  } catch (error) {
    return next(new Error("Unable to search for session Id to an user"));
  }
};
