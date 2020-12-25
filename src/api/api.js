import Ajax from './ajax';

const m5 = 300000;

class Api extends Ajax {
    klineData(symbol, interval, startTime = null, endTime = null, limit = 1000) {
        return this.ajax().get(`api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
            + (startTime? `&startTime=${startTime}` : '')
            + (endTime? `&endTime=${endTime}` : ''), {headers: {'Content-Type': 'application/json'}}
            )
    }

    klineAllData(symbol, interval, startTime = null, endTime = null, limit = 1000, data = []) {
        if(endTime) {
            return new Promise((resolve, reject) => {
                this.klineData(symbol, interval, startTime, endTime, limit).then(response => {
                    const responseData = response.data;
                    const endTimeData = responseData[responseData.length - 1][0];
                    if (endTimeData < endTime) {
                        resolve(this.klineAllData(symbol, endTime, endTimeData + m5, endTime, limit, data.concat(responseData)))
                    } else resolve( {
                        data: data.concat(responseData)
                    })
                })
            })
        } else return this.klineData(symbol, interval, startTime, endTime, limit)
    }
}

const api = new Api();
export default api;
