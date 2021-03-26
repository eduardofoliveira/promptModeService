const { connection } = require("../database/connection")

class schedulerRepository {
    async getSchedule({ dia_semana, hora, minuto }) {
        return new Promise(async (resolve, reject) => {
            try {
                const [schedules] = await connection.raw(`
                    SELECT
                        d.dominio,
                        p.did,
                        p.destino
                    FROM
                        programacoes p,
                        dominios d
                    WHERE
                        p.fk_id_dominio = d.id and
                        p.dia_semana = ${dia_semana} and
                        p.hora = ${hora} and
                        p.minuto = ${minuto} and
                        p.did not in (
                                SELECT
                                    did
                                FROM
                                    feriados
                                WHERE
                                    now() BETWEEN inicio and fim and
                                    fk_id_dominio = d.id
                                )
                                order by
                                did, dia_semana, hora, minuto
                                DESC
                `)

                resolve(schedules)
            } catch (error) {
                reject(error)
            }
        })
    }

    async getHolidays({ data }) {
        return new Promise(async (resolve, reject) => {
            try {
                const [holydays] = await connection.raw(`
                    SELECT
                        *
                    FROM
                        feriados f,
                        dominios d
                    WHERE
                        f.fk_id_dominio = d.id and
                        (inicio = '${data}' || fim = '${data}')
                    ORDER BY
                        inicio,
                        fim
                `)

                resolve(holydays)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = schedulerRepository
