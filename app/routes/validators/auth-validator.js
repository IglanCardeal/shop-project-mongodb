exports.loginValidator = body => [
  body("email", "Invalid email format! Try again.")
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password format! Try again.")
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 25 }),
  body("keep").custom((value, { req }) => {
    const valid = Boolean(value === "yes" || value === undefined);
    if (!valid) {
      throw new Error("Invalid value for keep connected!");
    }
    return true;
  })
];

exports.resetPassValidator = body => [
  body(
    "password",
    "Invalid password format! Use only alphanumerics characters and at least 3 and maximum 25 characters password."
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 25 }),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("The passwords are not equal! Try again.");
      }
      return true;
    }),
  body("userId", "Invalid ID!")
    .isAlphanumeric()
    .isEmpty(),
  body("token", "Invalid token!")
    .isAlphanumeric()
    .isEmpty()
];

exports.signupValidator = (check, body) => [
  check(
    "username",
    "Your name account must have only alphabetic characters! Try again."
  )
    .isAlpha()
    .trim(),
  check("email", "Not valid email! Try again.")
    .isEmail()
    .normalizeEmail()
    .custom((value, { req }) => {
      if (value === process.env.APP_EMAIL) {
        throw new Error("This email address is not allowed!");
      }
      return true;
    }),
  body(
    "password",
    "Invalid password format! Use only alphanumerics characters and at least 3 and maximum 25 characters password."
  )
    .isAlphanumeric()
    .trim()
    .isLength({ min: 3, max: 25 }),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("The passwords are not equal! Try again.");
      }
      return true;
    })
];
