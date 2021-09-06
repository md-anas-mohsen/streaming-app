const Pool = require("pg").Pool;
require("dotenv").config({ path: "backend/config/config.env" });

const db = new Pool({
  user: process.env.DB_LOCAL_USER,
  password: process.env.DB_LOCAL_PASSWORD,
  host: process.env.DB_LOCAL_HOST,
  port: process.env.DB_LOCAL_PORT,
  database: process.env.DB_NAME,
});

module.exports = db;
