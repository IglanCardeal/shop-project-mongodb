/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { validationResult } = require('express-validator/check');

const User = require('../models/user');
const { catchServerErrorFunction } = require('./error-controller');
const sendGridTransport = require('../utils/sendgrid-transport');
const htmlBodyEmail = require('../utils/body-email');

const inCaseOfNoUserFoundToResetPassword = (req, res, msg) => {
  req.flash('error', msg);
  return res.redirect('/reset-password');
};

const inCaseOfInvalidData = (res, email, errorMsg, field) => {
  return res.status(422).render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    email,
    error: errorMsg,
    field,
  });
};

const generateRandomToken = () => {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (error, buffer) => {
      if (error) {
        throw error;
      }

      resolve(buffer.toString('hex'));
    });
  });
};

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    email: '',
    error: req.flash('error'),
    field: '',
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password, keep } = req.body;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return inCaseOfInvalidData(
        res,
        email,
        errors.array()[0].msg,
        errors.array()[0].param
      );
    }

    const user = await User.findOne({
      email: email,
    })
      .select('+password')
      .exec();

    if (!user) {
      return inCaseOfInvalidData(res, email, 'User not found! Try again.', '');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return inCaseOfInvalidData(
        res,
        email,
        'Invalid email or password! Try again.',
        ''
      );
    }

    if (keep === 'yes') {
      const twelveHours = 86400000 / 2;
      req.session.cookie.maxAge = twelveHours;
    }

    req.session.isLoggedIn = true;
    req.session.userId = user._id;

    await req.session.save();

    return res.redirect('/');
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to login!',
      false,
      next
    );
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    await req.session.destroy();

    return res.redirect('/login');
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to logout!',
      false,
      next
    );
  }
};

exports.getSignup = (req, res) => {
  return res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    username: '',
    email: '',
    error: req.flash('error'),
    field: '',
  });
};

exports.postSignup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        username,
        email,
        error: errors.array()[0].msg,
        field: errors.array()[0].param,
      });
    }

    const emailAlreadyExist = await User.findOne({ email: email });

    if (emailAlreadyExist) {
      return res.status(422).render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        username,
        email,
        error: 'The email is already in use! Try another one.',
        field: 'email',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.flash('error', 'Account created. Log in!');

    return res.redirect('/login');
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to signup!',
      false,
      next
    );
  }
};

exports.getReset = (req, res) => {
  return res.render('auth/reset-password', {
    pageTitle: 'Reset Password',
    path: '/reset',
    msg: 'Inform your account email to reset the password.',
    field: '',
    error: req.flash('error'),
  });
};

exports.postReset = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: '/reset',
        msg: 'Inform your account email to reset the password.',
        field: 'email',
        error: 'No account found! Try another email.',
      });
    }

    const token = await generateRandomToken();
    
    user.resetToken = token;

    // 1 hora para expirar o token.
    user.tokenExpiration = Date.now() + 3600000;

    await user.save();

    sendGridTransport.sendMail({
      to: email,
      // to: "your@gmail.com", // email de teste
      from: process.env.APP_EMAIL,
      subject: 'Reseting your account password on Online Shop Project',
      html: htmlBodyEmail(`${req.protocol}://${req.get('host')}`, token),
    });

    return res.render('auth/mailed', {
      pageTitle: 'Email Sended',
      path: '/mailed',
      msg: 'Email sended to your email account! Check it out.',
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to reset your password!',
      false,
      next
    );
  }
};

exports.getResetToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return inCaseOfNoUserFoundToResetPassword(
        req,
        res,
        'Time to reset password expired! Try again.'
      );
    }

    return res.render('auth/set-new-password', {
      pageTitle: 'Set New Password',
      path: '/set-new-password',
      error: req.flash('error'),
      userId: user._id.toString(),
      token,
    });
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to reset your password!',
      false,
      next
    );
  }
};

exports.postSetNewPassword = async (req, res, next) => {
  const { password, confirmPassword, userId, token } = req.body;
  const passwordsAreEquals = password === confirmPassword;

  if (!passwordsAreEquals) {
    req.flash('error', 'The passwords are not equal!');
    return res.redirect(`/reset/${token}`);
  }

  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return inCaseOfNoUserFoundToResetPassword(
        req,
        res,
        'Unable to reset password! Send your email again and try again later.'
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined; // reset de token e tempo de expiracao.
    user.tokenExpiration = undefined;

    await user.save();

    req.flash('error', 'Your password has been reset! Try to login now.');

    return res.redirect('/login');
  } catch (error) {
    return catchServerErrorFunction(
      error,
      500,
      'Unable to reset your password!',
      false,
      next
    );
  }
};
