import './App.css';
import CandlestickChart from './components/Chart'
import api from './api/api'
import React from "react";
import {symbolList, intervalList} from "./utils/constants";
import {
    Col,
    Row,
    Input
} from 'reactstrap'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            klineData: [],
            symbol: 'BTCUSDT',
            interval: '1w',
            startDate: null,
            startTime: '00:00',
            endDate: null,
            endTime: '00:00',
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
    componentDidMount() {
        api.klineData(this.state.symbol, this.state.interval).then(response => {
            const data = this.transferResposneToKlineChartData(response)
            this.setState({klineData: data})
        })
    }

    render() {
        return (
            <div className="App">
                <Row>
                    <Col md="10">
                        <CandlestickChart klineData={this.state.klineData} klineName={`${this.state.symbol} - ${this.state.interval}`}/>
                    </Col>
                    <Col md="2">
                        <Row>
                            <h3>Pair:</h3>
                            <Input type="select" name="symbol" onChange={(e) => this.handleChange(e)} value={this.state.symbol}>
                                {symbolList.map(e => <option>{e}</option>)}
                            </Input>
                        </Row>
                        <Row>
                            <h3>Interval:</h3>
                            <Input type="select" name="interval" onChange={(e) => this.handleChange(e)} value={this.state.interval}>
                                {intervalList.map(e => <option>{e}</option>)}
                            </Input>
                        </Row>
                        <Row>
                            <h3>Start time:</h3>
                            <Input type="date" name="startDate" onChange={(e) => this.handleChange(e)} value={this.state.startDate} />
                            <Input type="time" name="startTime" onChange={(e) => this.handleChange(e)} value={this.state.startTime} />
                        </Row>
                        <Row>
                            <h3>End time:</h3>
                            <Input type="date" name="endDate" onChange={(e) => this.handleChange(e)} value={this.state.endDate} />
                            <Input type="time" name="endTime" onChange={(e) => this.handleChange(e)} value={this.state.endTime} />
                        </Row>
                    </Col>
                </Row>
                <Row>

                </Row>
            </div>
        );
    }
}

export default App;
