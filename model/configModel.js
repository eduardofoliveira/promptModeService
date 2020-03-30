const conn = require('../service/mariadb')

class configModel {
  getUrl() {
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await conn.query(`SELECT valor FROM config WHERE chave = "url_webservice"`);

        rows = rows.map(item => item)

        resolve(rows[0].valor)
      } catch (error) {
        reject(error)
      }
    })
  }

  getEmailNotificacao() {
    return new Promise(async (resolve, reject) => {
      try {
        let rows = await conn.query(`SELECT valor FROM config WHERE chave = "email_notificacao"`);

        rows = rows.map(item => item)

        resolve(rows[0].valor)
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = new configModel()