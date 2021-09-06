const app = require("./app");

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});

module.exports = server;
