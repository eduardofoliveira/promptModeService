const mariadb = require('mariadb')
const pool = mariadb.createPool({
    host: process.env.MARIA_DB_URL,
    user: process.env.MARIA_DB_USER,
    password: process.env.MARIA_DB_PASS,
    database: process.env.MARIA_DB_DATABASE,
    port: process.env.MARIA_DB_PORT,
    connectionLimit: 5
})

module.exports = pool