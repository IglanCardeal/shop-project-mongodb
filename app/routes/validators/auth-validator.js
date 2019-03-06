module.exports = (check, body) => [
  check(
    "username",
    "Your name account must have only alphabetic characters! Try again."
  ).isAlpha(),
  check("email", "Not valid email! Try again.")
    .isEmail()
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
    .isLength({ min: 3, max: 25 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords are not equal! Try again.");
    }
    return true;
  })
];
