import React from "react";
import ReactExport from "react-export-excel";
import {Button} from "reactstrap";
import {balanceBeforeTrade} from "../utils/constants";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class Download extends React.Component {
    generateResult() {
        if(this.props.analysisData) {
            let result = {
                totalEntry: 0,
                totalStopLoss: 0,
                totalTakeProfit: 0,
                balanceBeforeTrade: balanceBeforeTrade,
                balanceAfterAllIn: balanceBeforeTrade
            }
            this.props.analysisData.forEach(data => {
                if(data.indexLabel === 'entry') {
                    result.totalEntry++
                    if(result[data.y]) {
                        result[data.y]++
                    } else result[data.y] = 1
                }
                else if(data.indexLabel === 'tp') {
                    result.totalTakeProfit++
                    result.balanceAfterAllIn = result.balanceAfterAllIn*(1+this.props.takeProfitPercent/100)
                }
                else if(data.indexLabel === 'sl') {
                    result.totalStopLoss++
                    result.balanceAfterAllIn = result.balanceAfterAllIn*(1-this.props.stopLossPercent/100)
                }
            })
            return Object.keys(result).map(e => {
                const preTitle = e.replace( /([A-Z])/g, " $1" )
                return {
                    name: preTitle.charAt(0).toUpperCase() + preTitle.slice(1),
                    total: result[e]
                }
            })
        } else return []
    }

    render() {
        const result = this.generateResult()
        return (
            <ExcelFile filename={this.props.klineName} element={<Button className="btn-info">Download Result</Button>}>
                <ExcelSheet data={this.props.analysisData} name="Log">
                    <ExcelColumn label="Date" value="x"/>
                    <ExcelColumn label="Price" value="y"/>
                    <ExcelColumn label="Action" value="indexLabel"/>
                </ExcelSheet>
                <ExcelSheet data={result} name="Result">
                    <ExcelColumn label="Name" value="name"/>
                    <ExcelColumn label="Total" value="total"/>
                </ExcelSheet>
            </ExcelFile>
        );
    }
}
export default Download;