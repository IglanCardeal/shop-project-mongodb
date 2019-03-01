const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendGrid = require("nodemailer-sendgrid-transport");

const User = require("../models/user");
const { errorHandler } = require("./error-controller");

// Informamos ao nodemailer, qual o servico que sera usado para enviar emails.
// SendGrid sera usado como third service para o envio e tera as informacoes da key da conta.
const transport = nodemailer.createTransport(
  sendGrid({
    auth: {
      api_key: process.env.SENDGRID_KEY
    }
  })
);

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
    if (await checkAllCredentials(email, password, req, res))
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
exports.postSignup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (await checkIncomingData(email, password, confirmPassword, req, res)) {
      await saveNewUser(username, email, password);
      // Envia email pelo metodo sendMail. Apesar de async, nao use await pois evita bloqueio quando muitos emails forem cadastrados simultaneamente.
      transport.sendMail({
        to: email,
        from: process.env.APP_EMAIL,
        subject: "Account Created",
        html: `
          <h1>Successfully signed up!</h1>
          <p>Now you can access the online shop website. </p>
        `
      });
      req.flash("error", "Account created. Sign in!");
      res.redirect("/login");
    }
  } catch (error) {
    console.log("Error: ", error);
    return errorHandler(res, "Unable to signup!");
  }
};

exports.getReset = (req, res) => {
  let msg = "Inform your account email to reset the password.";
  res.render("auth/reset-password", {
    pageTitle: "Reset Password",
    path: "/reset",
    msg,
    error: req.flash("error")
  });
};

exports.postReset = async (req, res) => {
  const { email } = req.body;
  try {
    const buffer = await crypto.randomBytes(32);
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "No account found! Try another email.");
      return res.redirect("/reset-password");
    }
    user.resetToken = token;
    // 1 hora para expirar o token.
    user.tokenExpiration = Date.now() + 3600000;
    await user.save();
    transport.sendMail({
      // to: email,
      to: "cubeleexuzz@gmail.com", // seu email de teste
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
    // mostrar uma pagina com a msg de email enviado para realizar reset password
    // res.render('/info', { msg: 'Email sended!' })
    res.redirect("/");
  } catch (error) {
    console.log("Error: ", error);
    req.flash("error", "Unable to reset your password!");
    return res.redirect("/login");
  }
};

exports.getResetToken = async (req, res) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      req.flash("error", "Time to reset password expired! Try again.");
      return res.redirect("/reset-password");
    }
    res.render("auth/set-new-password", {
      pageTitle: "Set New Password",
      path: "/set-new-password",
      error: "Set a new password down here:",
      userId: user._id.toString(),
      token
    });
  } catch (error) {
    console.log("Error: ", error);
    req.flash("error", "Unable to reset your password!");
    return res.redirect("/reset");
  }
};

exports.postSetNewPassword = async (req, res) => {
  const { password, confirmPassword, userId, token } = req.body;
  if (!checkPasswords(password, confirmPassword)) {
    req.flash("error", "The passwords are not equal!");
    return res.redirect("/reset-password");
  }
  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      tokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      req.flash(
        "error",
        "Unable to reset password! Send your email again and try again later."
      );
      return res.redirect("/reset-password");
    }
    user.password = await bcrypt.hash(password, 12);
    user.resetToken = user.tokenExpiration = undefined;
    await user.save();
    req.flash("error", "Your password has been reset! Try to login now.");
    res.redirect("/login");
  } catch (error) {
    console.log("Error: ", error);
    req.flash("error", "Unable to reset your password!");
    return res.redirect("/reset");
  }
};

const emailAlreadyExist = async email => {
  const user = await User.findOne({ email: email });
  return user ? true : false;
};

const checkPasswords = (pass1, pass2) => pass1 === pass2;

const checkIncomingData = async (
  email,
  password,
  confirmPassword,
  req,
  res
) => {
  if (await emailAlreadyExist(email)) {
    req.flash("error", "The email is already in use! Try another one.");
    return res.redirect("/signup");
  }
  if (!checkPasswords(password, confirmPassword)) {
    req.flash("error", "The passwords are not equal! Try again.");
    return res.redirect("/signup");
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

const checkAllCredentials = async (email, password, req, res) => {
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
  return true;
};
