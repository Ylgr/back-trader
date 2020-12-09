import Ajax from './ajax';

class Api extends Ajax {
    klineData(symbol, interval, startTime = null, endTime = null, limit = 1000) {
        return this.ajax().get(`api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
            + (startTime? `&startTime=${startTime}` : '')
            + (endTime? `&endTime=${endTime}` : ''), {headers: {'Content-Type': 'application/json'}}
            )
    }
}

const api = new Api();
export default api;