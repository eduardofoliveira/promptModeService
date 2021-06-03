require("dotenv").config()
const CronJob = require("cron").CronJob

const config = require("./model/configModel")
const ProgramacoesRepository = require("./repository/programacoesRepository")
const { getFullDateTimeString } = require("./util")
const { getApi } = require("./service/api")
const log = require("./model/logModel")
const notificacao = require("./service/notificacao")

const executar = async () => {
    // agora = new Date(2021, 5, 3, 0, 0, 0)
    agora = new Date()
    let diaSemana = agora.getDay()
    let hora = agora.getHours()
    let minuto = agora.getMinutes()

    console.log({ diaSemana, hora, minuto })
    // console.log(agora.toLocaleString())

    let url = await config.getUrl()
    let toEmail = await config.getEmailNotificacao()

    const programacoesRepository = new ProgramacoesRepository()
    const programacoesSemana = await programacoesRepository.getProgramacoes({
        diaSemana,
        hora,
        minuto
    })

    const programacoesFeriado = await programacoesRepository.getFeriados(getFullDateTimeString(agora))
    const programacoesFimFeriado = await programacoesRepository.getFimFeriado(getFullDateTimeString(agora))

    const api = getApi({
        url
    })

    for (let i = 0; i < programacoesSemana.length; i++) {
        const programacao = programacoesSemana[i]

        try {
            if (programacao.did === "tronco") {
                let { data } = await api.get(`/setdefaultoperator/${programacao.destino}&${programacao.dominio}`)

                await log.addLog(
                    `${programacao.did} alterado para ${programacao.destino} no dominio ${programacao.dominio} com retorno: ${data.message}`
                )
            } else {
                let { data } = await api.get(`/set/${programacao.destino}&${programacao.dominio}&${programacao.did}`)

                await log.addLog(
                    `${programacao.did} alterado para ${programacao.destino} no dominio ${programacao.dominio} com retorno: ${data.message}`
                )
            }
        } catch (error) {
            await notificacao.enviarEmail(
                toEmail,
                programacao.dominio,
                programacao.did,
                programacao.destino,
                error.response.data
            )
        }
    }

    for (let i = 0; i < programacoesFeriado.length; i++) {
        const programacao = programacoesFeriado[i]

        try {
            if (programacao.did === "tronco") {
                let { data } = await api.get(`/setdefaultoperator/${programacao.destino}&${programacao.dominio}`)

                await log.addLog(
                    `${programacao.did} alterado para ${programacao.destino} no dominio ${programacao.dominio} com retorno: ${data.message}`
                )
            } else {
                let { data } = await api.get(`/set/${programacao.destino}&${programacao.dominio}&${programacao.did}`)

                await log.addLog(
                    `${programacao.did} alterado para ${programacao.destino} no dominio ${programacao.dominio} com retorno: ${data.message}`
                )
            }
        } catch (error) {
            await notificacao.enviarEmail(
                toEmail,
                programacao.dominio,
                programacao.did,
                programacao.destino,
                error.response.data
            )
        }
    }

    for (let i = 0; i < programacoesFimFeriado.length; i++) {
        const programacao = programacoesFimFeriado[i]

        try {
            if (programacao.did === "tronco") {
                let { data } = await api.get(`/setdefaultoperator/${programacao.destino}&${programacao.dominio}`)

                await log.addLog(
                    `${programacao.did} alterado para ${programacao.destino} no dominio ${programacao.dominio} com retorno: ${data.message}`
                )
            } else {
                let { data } = await api.get(`/set/${programacao.destino}&${programacao.dominio}&${programacao.did}`)

                await log.addLog(
                    `${programacao.did} alterado para ${programacao.destino} no dominio ${programacao.dominio} com retorno: ${data.message}`
                )
            }
        } catch (error) {
            await notificacao.enviarEmail(
                toEmail,
                programacao.dominio,
                programacao.did,
                programacao.destino,
                error.response.data
            )
        }
    }

    // console.log({
    //     url,
    //     toEmail,
    //     programacoesSemana,
    //     programacoesFeriado,
    //     programacoesFimFeriado
    // })
}

let job = new CronJob(
    "0 * * * * *",
    async () => {
        executar()
    },
    null,
    true,
    "America/Sao_Paulo"
)
