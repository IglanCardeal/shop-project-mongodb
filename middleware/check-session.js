const User = require("../app/models/user");

module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/login");
  req.user = user;
  next();
};
