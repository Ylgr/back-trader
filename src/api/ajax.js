import axios from 'axios';

class Ajax {
    constructor () {
        this.apiHost = "https://api3.binance.com"
    }

    ajax (loading = true) {
        return axios.create({
            baseURL: this.apiHost,
            responseType: 'json',
            crossDomain: true,
            withCredentials: false,
            transformResponse: [function (data) {
                return data;
            }]
        })
    }
}
export default Ajax
