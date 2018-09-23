const nodemailer = require('nodemailer')

const transportCloud = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

let enviarEmail = (to, dominio, did, destino, error_ws) => {

  let HelperOptions = {
    from: process.env.GMAIL_FROM,
    to: to,
    cc: process.env.GMAIL_CC,
    replyTo: { "name": process.env.GMAIL_REPLY_TO_NAME, "address": process.env.GMAIL_REPLY_TO_EMAIL },
    subject: `PromptMode - Aviso de Falha - ${dominio} ${did} ${destino}`,
    html: `Falha ao alterar o DID: ${did} para o destino: ${destino} no dominio: ${dominio}<br>${error_ws}`
  }

  transportCloud.sendMail(HelperOptions, (error, info) => {
    if (error) {
      return false
    } else {
      return true
    }
  })

}

module.exports = {
  enviarEmail
}