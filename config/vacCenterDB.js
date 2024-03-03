const mysql = require("mysql");

let connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root1234",
  database: "vacCenter",
});

module.exports = connection;
