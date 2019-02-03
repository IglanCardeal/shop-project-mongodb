require("dotenv").config();

module.exports = () => {
  if (process.env.NODE_ENV == "development") {
    console.log("=============== DEVELOPMENT ENV ===============");
    require("dotenv").load();
  } else {
    console.log(
      'WARNING: No "development" defined as environment has been set on NODE_ENV in .env!!!'
    );
    process.exit(0);
  }
};
