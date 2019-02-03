const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { errorHandler } = require("./error-controller");

exports.getLogin = (req, res, next) => {
  checkIfIsLogged(req, res);
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
    error: ""
  });
};

// Manter os dados no formulario em caso de erros.
exports.postLogin = (req, res, next) => {
  checkIfIsLogged(req, res);
  const { email, password } = req.body;
  const postLogin = async () => {
    try {
      const user = await User.findOne({
        email: email
      }).exec();
      if (!user) {
        return res.render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          isAuthenticated: false,
          error: "Email or password is not correct! Try again."
        });
      }
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        await req.session.save();
        return res.redirect("/");
      }
    } catch (error) {
      console.log("Error: ", error);
      return errorHandler(res, "Unable to login!");
    }
  };
  postLogin();
};

exports.postLogout = (req, res, next) => {
  const postLogout = async () => {
    try {
      await req.session.destroy();
      res.redirect("/login");
    } catch (error) {
      console.log("Error: ", error);
      return errorHandler(res, "Unable to logout!", req);
    }
  };
  postLogout();
};

exports.getSignup = (req, res, next) => {
  checkIfIsLogged(req, res);
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    isAuthenticated: false,
    error: ""
  });
};

// OBS: Adicionar verificacao e validacao de email e password.
// Manter os dados no formulario em caso de erros.
exports.postSignup = (req, res, next) => {
  checkIfIsLogged(req, res);
  const { username, email, password, confirmPassword } = req.body;
  const hasError = errorMsg => {
    return res.render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      isAuthenticated: false,
      error: errorMsg
    });
  };
  const postSignup = async () => {
    try {
      const emailAlreadyExist = async () => {
        return (await User.findOne({
          email: email
        }))
          ? true
          : false;
      };
      if (await emailAlreadyExist()) {
        return hasError("The email is already in use! Try another one.");
      }
      if (password !== confirmPassword) {
        return hasError("The passwords are not equal! Try again.");
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      await newUser.save();
      res.redirect("/login");
    } catch (error) {
      console.log("Error: ", error);
      return errorHandler(res, "Unable to signup!");
    }
  };
  postSignup();
};

const checkIfIsLogged = (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
};
