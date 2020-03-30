const conn = require('../service/mariadb')

class logModel {
  addLog(message) {
    return new Promise(async (resolve, reject) => {
      try {
        await conn.query(`
          INSERT INTO
            log
          (informacao)
            values
          (?)`, [`Alteração efetuada: ${message}`]);

        resolve()
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }
}

module.exports = new logModel()