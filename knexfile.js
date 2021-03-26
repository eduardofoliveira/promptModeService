require("dotenv").config()

module.exports = {
    production: {
        client: "mysql2",
        connection: {
            host: process.env.CLOUD_MYSQL_HOST,
            user: process.env.CLOUD_MYSQL_USER,
            password: process.env.CLOUD_MYSQL_PASS,
            database: process.env.CLOUD_MYSQL_DATABASE
        },
        pool: {
            min: 1,
            max: 5
        }
    }
}
