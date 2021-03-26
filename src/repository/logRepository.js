const { connection } = require("../database/connection")

class logRepository {
    async addInformation({ domain, user, information }) {
        return new Promise(async (resolve, reject) => {
            try {
                await connection("log_v2").insert({
                    dominio: domain,
                    usuario: user,
                    informacao: information
                })

                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = logRepository
