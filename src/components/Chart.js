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
                indexLabelFontSize: 16,
                name: this.props.klineName,
                yValueFormatString: "$###0.00",
                xValueFormatString: "MMMM YY",
                risingColor: "green",
                fallingColor: "red",
                dataPoints: this.props.klineData
            },{
                type: "line",
                indexLabelFontSize: 10,
                dataPoints: this.props.analysisData
            }]
        }
        return (
            <div>
                <h1>Toái Nguyệt Back Trade</h1>
                <CanvasJSChart options = {options}
                    onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }
}

export default CandlestickChart;