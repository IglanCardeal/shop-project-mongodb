/**
 * @usercontrol
 * @sendGrip modulo que usar key de conta para uso de servico de email da aplicacao.
 * Key do sendGrid definida nas variaveis de ambiente.
 * @bcrypt para criacao de hash de senha.
 * @crypto para gerar keys para envio de email.
 * Controller de autenticacao de usuario, criacao de usuario e redefinicao
 * de senha de acesso da conta.
 */

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendGrid = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");

const User = require("../models/user");

/**
 * catchServerErrorFunction recebe:
 * objeto de error.
 * httpStatusCode.
 * msg de erro, verificacao se chamada e um ajax.
 * next.
 * catchServerErrorFunction( @object , @number , @string , @boolean , @next )
 */
const { catchServerErrorFunction } = require("./error-controller");

// Informamos ao nodemailer, qual o servico que sera usado para enviar emails.
// SendGrid sera usado como third service para o envio e tera as informacoes da key da conta.
const transport = nodemailer.createTransport(
  sendGrid({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    email: "",
    error: req.flash("error"),
    field: ""
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password, keep } = req.body;
  try {
    if (await checkAllCredentials(email, password, keep, req, res))
      return res.redirect("/");
  } catch (error) {
    console.log("Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to login!",
      false,
      next
    );
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    await req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log("Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to logout!",
      false,
      next
    );
  }
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    username: "",
    email: "",
    error: req.flash("error"),
    field: ""
  });
};

exports.postSignup = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (await checkIncomingData(username, email, req, res)) {
      await saveNewUser(username, email, password);
      req.flash("error", "Account created. Log in!");
      res.redirect("/login");
    }
  } catch (error) {
    console.log("Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to signup!",
      false,
      next
    );
  }
};

exports.getReset = (req, res) => {
  res.render("auth/reset-password", {
    pageTitle: "Reset Password",
    path: "/reset",
    msg: "Inform your account email to reset the password.",
    field: "",
    error: req.flash("error")
  });
};

exports.postReset = async (req, res, next) => {
  const { email } = req.body;
  try {
    const buffer = await crypto.randomBytes(32);
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.render("auth/reset-password", {
        pageTitle: "Reset Password",
        path: "/reset",
        msg: "Inform your account email to reset the password.",
        field: "email",
        error: "No account found! Try another email."
      });
    }
    user.resetToken = token;
    // 1 hora para expirar o token.
    user.tokenExpiration = Date.now() + 3600000;
    await user.save();
    transport.sendMail({
      to: email,
      // to: "your@gmail.com", // email de teste
      from: process.env.APP_EMAIL,
      subject: "Reseting your account password on Online Shop Project",
      html: `
        <div style="text-align: center;">
          <h1>You requested a password reset!</h1>
          <h3 style="color: red">
            Ignore this message and do not click on link if you did not request a password reset on our website.
          </h3>
          <p>
            Click this <a href="${process.env.APP_URL +
              process.env
                .PORT}/reset/${token}">link</a> to set your new password!
          </p>
        </div>
      `
    });
    res.render("auth/mailed", {
      pageTitle: "Email Sended",
      path: "/mailed",
      msg: "Email sended to your email account! Check it out."
    });
  } catch (error) {
    console.log("Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to reset your password!",
      false,
      next
    );
  }
};

exports.getResetToken = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      return inCaseOfNoUserFoundToResetPassword(
        req,
        res,
        "Time to reset password expired! Try again."
      );
    }
    res.render("auth/set-new-password", {
      pageTitle: "Set New Password",
      path: "/set-new-password",
      error: req.flash("error"),
      userId: user._id.toString(),
      token
    });
  } catch (error) {
    console.log("Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to reset your password!",
      false,
      next
    );
  }
};

exports.postSetNewPassword = async (req, res, next) => {
  const { password, confirmPassword, userId, token } = req.body;
  if (!checkPasswords(password, confirmPassword)) {
    req.flash("error", "The passwords are not equal!");
    return res.redirect(`/reset/${token}`);
  }
  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      tokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      return inCaseOfNoUserFoundToResetPassword(
        req,
        res,
        "Unable to reset password! Send your email again and try again later."
      );
    }
    user.password = await bcrypt.hash(password, 12);
    user.resetToken = user.tokenExpiration = undefined;
    await user.save();
    req.flash("error", "Your password has been reset! Try to login now.");
    res.redirect("/login");
  } catch (error) {
    console.log("Error: ", error);
    return catchServerErrorFunction(
      error,
      500,
      "Unable to reset your password!",
      false,
      next
    );
  }
};

const inCaseOfNoUserFoundToResetPassword = (req, res, msg) => {
  req.flash("error", msg);
  return res.redirect("/reset-password");
};

const emailAlreadyExist = async email => {
  const user = await User.findOne({ email: email });
  if (user)
    return true;
  else 
    return false;
};

const checkIncomingData = async (username, email, req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      username,
      email,
      error: errors.array()[0].msg,
      field: errors.array()[0].param
    });
  }
  if (await emailAlreadyExist(email)) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      username,
      email,
      error: "The email is already in use! Try another one.",
      field: "email"
    });
  }
  return true;
};

const saveNewUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    username,
    email,
    password: hashedPassword
  });
  await newUser.save();
};

const checkAllCredentials = async (email, password, keep, req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return inCaseOfInvalidData(
      res,
      email,
      errors.array()[0].msg,
      errors.array()[0].param
    );
  }
  const user = await User.findOne({
    email: email
  })
    .select("+password")
    .exec();
  if (!user) {
    return inCaseOfInvalidData(res, email, "User not found! Try again.", "");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return inCaseOfInvalidData(
      res,
      email,
      "Invalid email or password! Try again.",
      ""
    );
  }
  if (keep === "yes") {
    req.session.cookie.maxAge = 86400000 / 2; // 12 horas
    req.session.resave = true;
  }
  req.session.isLoggedIn = true;
  req.session.userId = user._id;
  await req.session.save();
  return true;
};

const inCaseOfInvalidData = (res, email, errorMsg, field) => {
  return res.status(422).render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    email,
    error: errorMsg,
    field
  });
};
