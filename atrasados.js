require("dotenv").load();
const axios = require("axios");
const CronJob = require("cron").CronJob;
const conn = require("./service/mariadb");
const notificacao = require("./service/notificacao");
const { getFullDateTimeString } = require("./util");

let job = new CronJob(
  "0 * * * * *",
  async () => {
    // agora = new Date();
    agora = new Date(2020, 07, 17, 17, 0, 0);
    let diaSemana = agora.getDay();
    let hora = agora.getHours();
    let minuto = agora.getMinutes();

    console.log(diaSemana, hora, minuto)

    let rows = await conn.query(
      "SELECT dominio, did, destino FROM programacoes, dominios WHERE programacoes.fk_id_dominio = dominios.id and dia_semana = ? and hora = ? and minuto = ? and did not in (SELECT did FROM feriados WHERE now() BETWEEN inicio and fim and fk_id_dominio = dominios.id) order by did, dia_semana, hora, minuto desc",
      [diaSemana, hora, minuto]
    );

    let url = await conn.query('SELECT valor FROM config WHERE chave = "url_webservice"');

    // PROGRAMAÇÂO PARA DIAS DA SEMANA FORA DOS FERIADOS
    if (rows.length > 0) {
      let verif = /^ERRO/;

      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];

        try {
          if (item.did === "tronco") {
            let response = await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`);

            if (verif.test(response.data)) {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Erro WebService: ${item.dominio} ${item.destino} ${response.data}`
              ]);
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
              await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data);
            } else {
              await conn.query("INSERT INTO log (informacao) values (?)", [`Alteração efetuada: ${response.data}`]);
            }
          } else {
            let response = await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`);

            if (verif.test(response.data)) {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Erro WebService: ${item.did} ${item.dominio} ${item.destino} ${response.data}`
              ]);
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
              await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data);
            } else {
              await conn.query("INSERT INTO log (informacao) values (?)", [`Alteração efetuada: ${response.data}`]);
            }
          }
        } catch (error) {
          await conn.query("INSERT INTO log (informacao) values (?)", [
            `Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`
          ]);
          let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
          await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, error.code);
        }
      }
    }

    let timestamp_c = getFullDateTimeString(agora);

    let feriados_inicio = await conn.query(
      "SELECT dominio, did, destino FROM feriados, dominios WHERE feriados.fk_id_dominio = dominios.id and inicio = ?",
      [timestamp_c]
    );

    // PROGRAMAÇÂO PARA INICIOS DE FERIADOS
    if (feriados_inicio.length > 0) {
      let verif = /^ERRO/;

      for (let i = 0; i < feriados_inicio.length; i++) {
        const item = feriados_inicio[i];

        try {
          if (item.did === "tronco") {
            let response = await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`);

            if (verif.test(response.data)) {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Erro WebService: ${item.dominio} ${item.destino} ${response.data}`
              ]);
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
              await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data);
            } else {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Alteração efetuada - INICIO FERIADO: ${response.data}`
              ]);
            }
          } else {
            let response = await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`);

            if (verif.test(response.data)) {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Erro WebService: ${item.did} ${item.dominio} ${item.destino} ${response.data}`
              ]);
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
              await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data);
            } else {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Alteração efetuada - INICIO FERIADO: ${response.data}`
              ]);
            }
          }
        } catch (error) {
          await conn.query("INSERT INTO log (informacao) values (?)", [
            `Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`
          ]);
          let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
          await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, error.code);
        }
      }
    }

    let feriados_fim = await conn.query(
      "SELECT dominio, did, destino_pos as destino FROM feriados, dominios WHERE feriados.fk_id_dominio = dominios.id and fim = ?",
      [timestamp_c]
    );

    // PROGRAMAÇÂO PARA TERMINOS DE FERIADOS
    if (feriados_fim.length > 0) {
      let verif = /^ERRO/;

      for (let i = 0; i < feriados_fim.length; i++) {
        const item = feriados_fim[i];

        try {
          if (item.did === "tronco") {
            let response = await axios.get(`${url[0].valor}/setdefaultoperator/${item.destino}&${item.dominio}`);

            if (verif.test(response.data)) {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Erro WebService: ${item.dominio} ${item.destino} ${response.data}`
              ]);
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
              await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data);
            } else {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Alteração efetuada - FIM FERIADO: ${response.data}`
              ]);
            }
          } else {
            let response = await axios.get(`${url[0].valor}/set/${item.destino}&${item.dominio}&${item.did}`);

            if (verif.test(response.data)) {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Erro WebService: ${item.did} ${item.dominio} ${item.destino} ${response.data}`
              ]);
              let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
              await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, response.data);
            } else {
              await conn.query("INSERT INTO log (informacao) values (?)", [
                `Alteração efetuada - FIM FERIADO: ${response.data}`
              ]);
            }
          }
        } catch (error) {
          await conn.query("INSERT INTO log (informacao) values (?)", [
            `Codido de Erro: ${error.code} ao efetuar a requisição: ${error.config.url}`
          ]);
          let result = await conn.query('SELECT valor FROM config where chave = "email_notificacao"');
          await notificacao.enviarEmail(result[0].valor, item.dominio, item.did, item.destino, error.code);
        }
      }
    }
  },
  null,
  true,
  "America/Sao_Paulo"
);