const axios = require("axios")

const getApi = ({ url }) => {
    const api = axios.create({
        baseURL: `${url}`
    })

    return api
}

module.exports = {
    getApi
}
