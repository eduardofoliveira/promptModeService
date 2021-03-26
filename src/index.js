require("dotenv").config()
const { format } = require("date-fns")
const CronJob = require("cron").CronJob

const SchedulerRepository = require("./repository/schedulerRepository")
const LogRepository = require("./repository/logRepository")
const { alterarProgramacao } = require("./service/api")
const { enviarEmail } = require("./service/notificacao")

const executar = async () => {
    agora = new Date()
    // agora = new Date(2021, 02, 26, 17, 10, 0)
    let diaSemana = agora.getDay()
    let hora = agora.getHours()
    let minuto = agora.getMinutes()

    console.log({ diaSemana, hora, minuto })

    const schedulerRepository = new SchedulerRepository()
    const schedules = await schedulerRepository.getSchedule({
        dia_semana: diaSemana,
        hora,
        minuto
    })

    console.log(`${schedules.length} programações de dia de semana`)

    for (let i = 0; i < schedules.length; i++) {
        const item = schedules[i]

        try {
            const response = await alterarProgramacao({
                domain: item.dominio,
                did: item.did,
                destino: item.destino
            })

            const logRepository = new LogRepository()
            await logRepository.addInformation({
                domain: item.dominio,
                user: "promptMode",
                information: response
            })

            if (response.includes("ERRO")) {
                enviarEmail("suporte.basix@cloudcom.com.br", item.dominio, item.did, item.destino, response)
            }
        } catch (error) {
            enviarEmail("suporte.basix@cloudcom.com.br", item.dominio, item.did, item.destino, error.message)
        }
    }

    console.log(format(agora, "yyyy-MM-dd HH:mm:ss"))

    const holydays = await schedulerRepository.getHolidays({
        data: format(agora, "yyyy-MM-dd HH:mm:ss")
    })

    console.log(`${holydays.length} programações de feriados`)

    for (let i = 0; i < holydays.length; i++) {
        const item = holydays[i]
        item.inicio = format(item.inicio, "yyyy-MM-dd HH:mm:ss")
        item.fim = format(item.fim, "yyyy-MM-dd HH:mm:ss")

        if (item.inicio === format(agora, "yyyy-MM-dd HH:mm:ss")) {
            try {
                const response = await alterarProgramacao({
                    domain: item.dominio,
                    did: item.did,
                    destino: item.destino
                })

                const logRepository = new LogRepository()
                await logRepository.addInformation({
                    domain: item.dominio,
                    user: "promptMode_inicio_feriado",
                    information: response
                })

                if (response.includes("ERRO")) {
                    enviarEmail("suporte.basix@cloudcom.com.br", item.dominio, item.did, item.destino, response)
                }
            } catch (error) {
                enviarEmail("suporte.basix@cloudcom.com.br", item.dominio, item.did, item.destino, error.message)
            }
        }
        if (item.fim === format(agora, "yyyy-MM-dd HH:mm:ss")) {
            try {
                const response = await alterarProgramacao({
                    domain: item.dominio,
                    did: item.did,
                    destino: item.destino_pos
                })

                const logRepository = new LogRepository()
                await logRepository.addInformation({
                    domain: item.dominio,
                    user: "promptMode_termino_feriado",
                    information: response
                })

                if (response.includes("ERRO")) {
                    enviarEmail("suporte.basix@cloudcom.com.br", item.dominio, item.did, item.destino, response)
                }
            } catch (error) {
                enviarEmail("suporte.basix@cloudcom.com.br", item.dominio, item.did, item.destino, error.message)
            }
        }
    }
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
