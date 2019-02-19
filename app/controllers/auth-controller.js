const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { errorHandler } = require("./error-controller");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    error: req.flash("error")
  });
};

// Manter os dados no formulario em caso de erros.
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email: email
    })
      .select("+password")
      .exec();
    if (!user) {
      req.flash("error", "Invalid email or password!");
      return res.redirect("/login");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      req.flash("error", "Invalid email or password!");
      return res.redirect("/login");
    }
    req.session.isLoggedIn = true;
    req.session.userId = user._id;
    await req.session.save();
    return res.redirect("/");
  } catch (error) {
    console.log("Error: ", error);
    return errorHandler(res, "Unable to login!");
  }
};

exports.postLogout = async (req, res) => {
  try {
    await req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log("Error: ", error);
    return errorHandler(res, "Unable to logout!", req);
  }
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    error: req.flash("error")
  });
};

// OBS: Adicionar verificacao e validacao de email e password.
// Manter os dados no formulario em caso de erros.
exports.postSignup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    const emailAlreadyExist = async () => {
      return (await User.findOne({
        email: email
      }))
        ? true
        : false;
    };
    if (await emailAlreadyExist()) {
      req.flash("error", "The email is already in use! Try another one.");
      return res.redirect("/signup");
    }
    if (password !== confirmPassword) {
      req.flash("error", "The passwords are not equal! Try again.");
      return res.redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    await newUser.save();
    // personalizar esta msg para o login.
    req.flash("error", "Account created. Sign in!");
    res.redirect("/login");
  } catch (error) {
    console.log("Error: ", error);
    return errorHandler(res, "Unable to signup!");
  }
};
