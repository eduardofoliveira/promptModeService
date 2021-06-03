const conn = require("../service/mariadb")

class programacoesRepository {
    getProgramacoes({ diaSemana, hora, minuto }) {
        return new Promise(async (resolve, reject) => {
            try {
                let rows = await conn.query(
                    `
                SELECT
                    dominio,
                    did,
                    destino
                FROM
                    programacoes,
                    dominios
                WHERE
                    programacoes.fk_id_dominio = dominios.id and
                    dia_semana = ? and
                    hora = ? and
                    minuto = ? and
                    did not in (
                    SELECT
                        did
                    FROM
                        feriados
                    WHERE
                        now() BETWEEN inicio and fim and
                        fk_id_dominio = dominios.id
                    )
                    order by
                    did, dia_semana, hora, minuto
                    desc`,
                    [diaSemana, hora, minuto]
                )

                rows = rows.map((item) => item)

                resolve(rows)
            } catch (error) {
                reject(error)
            }
        })
    }

    getFeriados(horario) {
        return new Promise(async (resolve, reject) => {
            try {
                let rows = await conn.query(
                    `
              SELECT
                dominio,
                did,
                destino
              FROM
                feriados,
                dominios
              WHERE
                feriados.fk_id_dominio = dominios.id and
                inicio = ?
            `,
                    [horario]
                )

                rows = rows.map((item) => item)

                resolve(rows)
            } catch (error) {
                reject(error)
            }
        })
    }

    getFimFeriado(horario) {
        return new Promise(async (resolve, reject) => {
            try {
                let rows = await conn.query(
                    `
              SELECT
                dominio,
                did,
                destino_pos as destino
              FROM
                feriados,
                dominios
              WHERE
                feriados.fk_id_dominio = dominios.id and
                fim = ?
            `,
                    [horario]
                )

                rows = rows.map((item) => item)

                resolve(rows)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = programacoesRepository
