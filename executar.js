require("dotenv").config()

const executar = async () => {
    agora = new Date()
    let diaSemana = agora.getDay()
    let hora = agora.getHours()
    let minuto = agora.getMinutes()
    console.log({ diaSemana, hora, minuto })
}

executar()
