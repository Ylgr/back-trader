import './App.css';
import CandlestickChart from './components/Chart'
import api from './api/api'
import React from "react";
import {symbolList, intervalList} from "./utils/constants";
import {
    Col,
    Row,
    Input,
    Label,
    Button
} from 'reactstrap'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            klineData: [],
            analysisData: [],
            symbol: 'BTCUSDT',
            interval: '1w',
            startDate: null,
            startTime: '00:00',
            endDate: null,
            endTime: '00:00',
            firstEntry: null,
            position: 'LONG',
            rangePercent: null,
            stopLossPercent: null,
            takeProfitPercent: null,
            isAutoReEntry: false,
            analysisLog: []
        }
    }

    transferResposneToKlineChartData(response) {
        return response.data.map(data => {
            return {
                x: new Date(data[0]),
                y: [
                    parseFloat(data[1]),
                    parseFloat(data[2]),
                    parseFloat(data[3]),
                    parseFloat(data[4])
                ]
            }
        })
    }

    handleChange(event) {

        this.setState({[event.target.name]: event.target.value});
        const symbol = event.target.name === 'symbol'? event.target.value : this.state.symbol
        const interval = event.target.name === 'interval'? event.target.value : this.state.interval
        const startDate = event.target.name === 'startDate'? event.target.value : this.state.startDate
        const startTime = event.target.name === 'startTime'? event.target.value : this.state.startTime
        const endDate = event.target.name === 'endDate'? event.target.value : this.state.endDate
        const endTime = event.target.name === 'endTime'? event.target.value : this.state.endTime
        const startDateTime = (startDate && typeof startTime) ? (new Date(startDate + ' ' + startTime)).valueOf() : null
        const endDateTime = (endDate && typeof endTime) ? (new Date(endDate + ' ' + endTime)).valueOf() : null
        api.klineData(symbol, interval, startDateTime, endDateTime).then(response => {
            const data = this.transferResposneToKlineChartData(response)
            this.setState({klineData: data})
        })
    }

    handleChangeAnalysis(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleChangeCheckBox(event) {
            this.setState({[event.target.name]: !this.state[event.target.name]});
    }

    componentDidMount() {
        api.klineData(this.state.symbol, this.state.interval).then(response => {
            const data = this.transferResposneToKlineChartData(response)
            this.setState({klineData: data})
        })
    }

    isInRange(price, candle) {
        return price >= candle.y[2] && price <= candle.y[1];
    }

    analysisLogging(newData) {
        const dataLog = this.state.analysisLog
        dataLog.push(newData)
        console.log('dataLog: ', dataLog)
        this.setState({analysisLog: dataLog})
    }

    tpAndSlProcess(candle, waitEntry, analysisData, stopLossPrice = null, takeProfitPrice = null) {
        if(takeProfitPrice && this.isInRange(takeProfitPrice, candle)) {
            const entry = parseFloat(takeProfitPrice)
            analysisData.push({x: candle.x, y: entry, indexLabel: 'tp',markerColor: 'green', markerType: 'triangle' })
            this.analysisLogging(`${candle.x}: Take profit at price ${entry}.`)
            return {
                waitEntry, analysisData, stopLossPrice: null, takeProfitPrice: null
            }
        }
        if(stopLossPrice && this.isInRange(stopLossPrice, candle)) {
            const entry = parseFloat(stopLossPrice)
            analysisData.push({x: candle.x, y: entry, indexLabel: 'sl',markerColor: 'red', markerType: 'cross' })
            this.analysisLogging(`${candle.x}: Stop loss at price ${entry}.`)
            if(this.state.isAutoReEntry) {
                const flow = this.state.position === 'LONG' ? 1 : -1
                waitEntry = waitEntry*(1 - flow*this.state.rangePercent/100)
            }
            return {
                waitEntry, analysisData, stopLossPrice: null, takeProfitPrice: null
            }
        }
        return {
            waitEntry, analysisData, stopLossPrice, takeProfitPrice
        }
    }

    entryProcess(waitEntry, candle, analysisData, stopLossPrice = null, takeProfitPrice = null) {
        const slAndTpResult = this.tpAndSlProcess(candle, waitEntry, analysisData, stopLossPrice, takeProfitPrice)
        analysisData = slAndTpResult.analysisData
        waitEntry = slAndTpResult.waitEntry
        if(this.isInRange(waitEntry, candle)) {
            const entry = parseFloat(waitEntry)
            analysisData.push({x: candle.x, y: entry, indexLabel: 'entry',markerColor: 'blue', markerType: 'circle' })
            this.analysisLogging(`${candle.x}: Entry at price ${entry}.`)
            const flow = this.state.position === 'LONG' ? 1 : -1

            stopLossPrice = entry*(1 - flow*this.state.stopLossPercent/100)
            takeProfitPrice = entry*(1 + flow*this.state.takeProfitPercent/100)

            waitEntry = waitEntry*(1 + flow*this.state.rangePercent/100)

            return this.entryProcess(waitEntry, candle, analysisData, stopLossPrice, takeProfitPrice)
        }

        return {
            waitEntry, analysisData
        }
    }

    processAnalysis() {
        this.setState({
            analysisData: [],
            analysisLog: []
        })
        let waitEntry = this.state.firstEntry
        let analysisData = []
        this.state.klineData.forEach(candle => {
            const result = this.entryProcess(waitEntry, candle, analysisData)
            waitEntry = result.waitEntry
            analysisData = result.analysisData
        })
        this.setState({analysisData: analysisData})
    }
    render() {
        return (
            <div className="App">
                <Row>
                    <Col md="10">
                        <CandlestickChart
                            klineData={this.state.klineData}
                            klineName={`${this.state.symbol} - ${this.state.interval}`}
                            analysisData={this.state.analysisData}
                        />
                    </Col>
                    <Col md="2">
                        <Row>
                            <Label>Pair:</Label>
                            <Input type="select" name="symbol" onChange={(e) => this.handleChange(e)} value={this.state.symbol}>
                                {symbolList.map(e => <option>{e}</option>)}
                            </Input>
                        </Row>
                        <Row>
                            <Label>Interval:</Label>
                            <Input type="select" name="interval" onChange={(e) => this.handleChange(e)} value={this.state.interval}>
                                {intervalList.map(e => <option>{e}</option>)}
                            </Input>
                        </Row>
                        <Row>
                            <Label>Start time:</Label>
                            <Input type="date" name="startDate" onChange={(e) => this.handleChange(e)} value={this.state.startDate} />
                            <Input type="time" name="startTime" onChange={(e) => this.handleChange(e)} value={this.state.startTime} />
                        </Row>
                        <Row>
                            <Label>End time:</Label>
                            <Input type="date" name="endDate" onChange={(e) => this.handleChange(e)} value={this.state.endDate} />
                            <Input type="time" name="endTime" onChange={(e) => this.handleChange(e)} value={this.state.endTime} />
                        </Row>
                        <Row>
                            --------------
                        </Row>
                        <Row>
                            <Input type="number" name="firstEntry" onChange={(e) => this.handleChangeAnalysis(e)} value={this.state.firstEntry} placeholder="Entry (USDT)"/>
                        </Row>
                        <Row>
                            <Input type="select" name="position" onChange={(e) => this.handleChangeAnalysis(e)} value={this.state.position}>
                                <option>LONG</option>
                                <option>SHORT</option>
                            </Input>
                        </Row>
                        <Row>
                            <Input type="number" name="rangePercent" onChange={(e) => this.handleChangeAnalysis(e)} value={this.state.rangePercent} placeholder="Range (%)"/>
                        </Row>
                        <Row>
                            <Input type="number" name="stopLossPercent" onChange={(e) => this.handleChangeAnalysis(e)} value={this.state.stopLossPercent} placeholder="Stop loss (%)"/>
                        </Row>
                        <Row>
                            <Input type="number" name="takeProfitPercent" onChange={(e) => this.handleChangeAnalysis(e)} value={this.state.takeProfitPercent} placeholder="Take profit (%)"/>
                        </Row>
                        <Row>
                            <Input name="isAutoReEntry" type="checkbox"
                                   defaultChecked={this.state.isAutoReEntry}
                                   onChange={(e) => this.handleChangeCheckBox(e)} disabled/>{' '}
                            Auto re-entry after stop loss
                        </Row>
                        <Row>
                            <Button onClick={() => this.processAnalysis()}>Analysis</Button>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    {this.state.analysisLog.map(e => <p>{e}</p>)}
                </Row>
            </div>
        );
    }
}

export default App;
