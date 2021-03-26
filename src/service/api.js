const axios = require("axios")

const api = axios.create({
    baseURL: "http://52.15.232.149:9000/basixws"
})

const alterarProgramacao = async ({ did, domain, destino }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (did === "tronco") {
                const { data } = await api.get(`/setdefaultoperator/${destino}&${domain}`, {
                    params: {
                        did,
                        domain,
                        user: destino
                    }
                })

                resolve(data)
            } else {
                const { data } = await api.get(`/set/${destino}&${domain}&${did}`, {
                    params: {
                        did,
                        domain,
                        user: destino
                    }
                })

                resolve(data)
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    api,
    alterarProgramacao
}
