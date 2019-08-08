const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  password: "pass",
  userName: "username",
  database: "database",
  host: "host",
  farm: "farm",
  sessionId: process.env.GT_SESSION_ID
};

// const { userNameGeo, password, database, host, farm } = process.env;
