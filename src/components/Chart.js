import React, { Component } from 'react';
import CanvasJSReact from '../assets/canvasjs.react';
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

class CandlestickChart extends Component {
    render() {
        const options = {
            theme: "light2", // "light1", "light2", "dark1", "dark2"
            animationEnabled: true,
            exportEnabled: true,
            title:{
                text: this.props.klineName
            },
            axisX: {
                valueFormatString: "MMM DD YY"
            },
            axisY: {
                includeZero:false,
                prefix: "$",
                title: "Price (in USDT)"
            },
            data: [{
                type: "candlestick",
                showInLegend: true,
                name: this.props.klineName,
                yValueFormatString: "$###0.00",
                xValueFormatString: "MMMM YY",
                dataPoints: this.props.klineData
            }]
        }
        return (
            <div>
                <h1>Phiêu Vũ Môn Back trade</h1>
                <CanvasJSChart options = {options}
                    onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }
}

export default CandlestickChart;