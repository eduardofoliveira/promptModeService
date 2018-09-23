require('dotenv').load()
const axios = require('axios')
const CronJob = require('cron').CronJob
const conn = require('./service/mariadb')
const notificacao = require('./service/notificacao')

let job = new CronJob('0 * * * * *', async () => {
  agora = new Date()
  let diaSemana = agora.getDay()
  let hora = agora.getHours()
  let minuto = agora.getMinutes()

  let rows = await conn.query('SELECT dominio, did, destino FROM programacoes, dominios WHERE programacoes.fk_id_dominio = dominios.id and dia_semana = ? and hora = ? and minuto = ? and did not in (SELECT did FROM feriados WHERE now() BETWEEN inicio and fim and fk_id_dominio = dominios.id) order by did, dia_semana, hora, minuto desc', [diaSemana, hora, minuto])
    .catch(error => {
      console.log(error.code)
    })

  let url = await conn.query('SELECT valor FROM config WHERE chave = "url_webservice"')
    .catch(error => {
      console.log(error.code)
    })

  // PROGRAMAÇÂO PARA DIAS DA SEMANA FORA DOS FERIADOS
  if (rows.length > 0) {
    let verif = /^ERRO/

    rows.forEach(async item => {
      if (item.did === 'tronco') {
        await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`)
          .then(async response => {
            if (verif.test(response.data)) {
              conn.query('INSERT INTO log (informacao) values (?)', [`Erro WebService: ${item.dominio} ${item.destino} ${response.data}`])
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            } else {
              conn.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada: ${response.data}`])
            }
          })
          .catch(async error => {
            conn.query('INSERT INTO log (informacao) values (?)', [`Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`])
            let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error.code)
          })
      } else {
        await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`)
          .then(async response => {
            if (verif.test(response.data)) {
              conn.query('INSERT INTO log (informacao) values (?)', [`Erro WebService: ${item.did} ${item.dominio} ${item.destino} ${response.data}`])
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            } else {
              conn.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada: ${response.data}`])
            }
          })
          .catch(async error => {
            conn.query('INSERT INTO log (informacao) values (?)', [`Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`])
            let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error.code)
          })
      }
    })
  }

  let timestamp_c = `${agora.getFullYear()}-${(agora.getMonth() + 1).toString().padStart(2, '0')}-${agora.getDate().toString().padStart(2, '0')} ${agora.toLocaleTimeString()}`

  let feriados_inicio = await conn.query('SELECT dominio, did, destino FROM feriados, dominios WHERE feriados.fk_id_dominio = dominios.id and inicio = ?', [timestamp_c])
    .catch(error => {
      console.log(error.code)
    })

  // PROGRAMAÇÂO PARA INICIOS DE FERIADOS
  if (feriados_inicio.length > 0) {
    let verif = /^ERRO/

    feriados_inicio.forEach(async item => {
      if (item.did === 'tronco') {
        await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`)
          .then(async response => {
            if (verif.test(response.data)) {
              conn.query('INSERT INTO log (informacao) values (?)', [`Erro WebService: ${item.dominio} ${item.destino} ${response.data}`])
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            } else {
              conn.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada - INICIO FERIADO: ${response.data}`])
            }
          })
          .catch(async error => {
            conn.query('INSERT INTO log (informacao) values (?)', [`Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`])
            let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error.code)
          })
      } else {
        await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`)
          .then(async response => {
            if (verif.test(response.data)) {
              conn.query('INSERT INTO log (informacao) values (?)', [`Erro WebService: ${item.did} ${item.dominio} ${item.destino} ${response.data}`])
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            } else {
              conn.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada - INICIO FERIADO: ${response.data}`])
            }
          })
          .catch(async error => {
            conn.query('INSERT INTO log (informacao) values (?)', [`Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`])
            let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error.code)
          })
      }
    })
  }

  let feriados_fim = await conn.query('SELECT dominio, did, destino_pos as destino FROM feriados, dominios WHERE feriados.fk_id_dominio = dominios.id and fim = ?', [timestamp_c])
    .catch(error => {
      console.log(error.code)
    })

  // PROGRAMAÇÂO PARA TERMINOS DE FERIADOS
  if (feriados_fim.length > 0) {
    let verif = /^ERRO/

    feriados_fim.forEach(async item => {
      if (item.did === 'tronco') {
        await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`)
          .then(async response => {
            if (verif.test(response.data)) {
              conn.query('INSERT INTO log (informacao) values (?)', [`Erro WebService: ${item.dominio} ${item.destino} ${response.data}`])
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            } else {
              conn.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada - FIM FERIADO: ${response.data}`])
            }
          })
          .catch(async error => {
            conn.query('INSERT INTO log (informacao) values (?)', [`Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`])
            let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error.code)
          })
      } else {
        await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`)
          .then(async response => {
            if (verif.test(response.data)) {
              conn.query('INSERT INTO log (informacao) values (?)', [`Erro WebService: ${item.did} ${item.dominio} ${item.destino} ${response.data}`])
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
              notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, response.data)
            } else {
              conn.query('INSERT INTO log (informacao) values (?)', [`Alteração efetuada - FIM FERIADO: ${response.data}`])
            }
          })
          .catch(async error => {
            conn.query('INSERT INTO log (informacao) values (?)', [`Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`])
            let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"')
            notificacao.enviarEmail(result[0].valor, item.dominio, 'tronco', item.destino, error.code)
          })
      }
    })
  }

}, null, true, 'America/Sao_Paulo')