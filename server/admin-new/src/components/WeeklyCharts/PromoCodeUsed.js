import React, { Component } from "react";
import { connect } from "react-redux";

import ReactChartist from "react-chartist";
import ctPointLabels from "chartist-plugin-pointlabels";

const dayToLabel = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat"
};

const dayToMS = 24 * 60 * 60 * 1000;

class PromoCodeUsed extends Component {
  getChartData() {
    const logs = this.props.promoCodeLogs.logs;
    console.log("Accounts Created : ", logs.length);
    let today = new Date();
    let maxCodeUsed = 0;
    let xData = {};
    let currDate = new Date();
    let retData = {
      data: {
        labels: [],
        series: [[], [],[],[]]
      },
      options: {
        height:200,
        lineSmooth: false,
        onlyInteger: true,
        low: 0,
        high: 20,
        classNames: {
          point: "ct-point ct-orange",
          line: "ct-line ct-orange"
        },
        plugins: [
          ctPointLabels({
            textAnchor: "middle",
            labelInterpolationFnc: function(value) {
              return value || 0;
            }
          })
        ]
      }
    };
    currDate.setHours(0);
    currDate.setMinutes(0);
    currDate.setSeconds(0);
    logs.forEach(log => {
      let currUsedDate = parseFloat(log.used_date);
      if (parseFloat(currUsedDate) > currDate.getTime() - 0 * dayToMS) {
        // falls in valid ts
        if (Object.keys(xData).includes("0")) {
          xData[0 + ""]["count"]++;
          if (xData[0 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[0 + ""]["count"];
          }
        } else {
          xData["0"] = {};
          xData["0"]["count"] = 1;
          xData["0"]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 1 * dayToMS) {
        if (Object.keys(xData).includes(1 + "")) {
          xData[1 + ""]["count"]++;
          if (xData[1 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[1 + ""]["count"];
          }
        } else {
          xData[1 + ""] = {};
          xData[1 + ""]["count"] = 1;
          xData[1 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 2 * dayToMS) {
        console.log("day 2", new Date(currUsedDate));
        if (Object.keys(xData).includes(2 + "")) {
          xData[2 + ""]["count"]++;
          if (xData[2 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[2 + ""]["count"];
          }
        } else {
          xData[2 + ""] = {};
          xData[2 + ""]["count"] = 1;
          xData[2 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 3 * dayToMS) {
        if (Object.keys(xData).includes(3 + "")) {
          xData[3 + ""]["count"]++;
          if (xData[3 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[3 + ""]["count"];
          }
        } else {
          xData[3 + ""] = {};
          xData[3 + ""]["count"] = 1;
          xData[3 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 4 * dayToMS) {
        if (Object.keys(xData).includes(4 + "")) {
          xData[4 + ""]["count"]++;
          if (xData[4 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[4 + ""]["count"];
          }
        } else {
          xData[4 + ""] = {};
          xData[4 + ""]["count"] = 1;
          xData[4 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 5 * dayToMS) {
        if (Object.keys(xData).includes(5 + "")) {
          xData[5 + ""]["count"]++;
          if (xData[5 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[5 + ""]["count"];
          }
        } else {
          xData[5 + ""] = {};
          xData[5 + ""]["count"] = 1;
          xData[5 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 6 * dayToMS) {
        if (Object.keys(xData).includes(6 + "")) {
          xData[6 + ""]["count"]++;
          if (xData[6 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[6 + ""]["count"];
          }
        } else {
          xData[6 + ""] = {};
          xData[6 + ""]["count"] = 1;
          xData[6 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      } else if (currUsedDate > currDate.getTime() - 7 * dayToMS) {
        if (Object.keys(xData).includes(7 + "")) {
          xData[7 + ""]["count"]++;
          if (xData[7 + ""]["count"] > maxCodeUsed) {
            maxCodeUsed = xData[7 + ""]["count"];
          }
        } else {
          xData[7 + ""] = {};
          xData[7 + ""]["count"] = 1;
          xData[7 + ""]["day"] = new Date(currUsedDate).getDay();
        }
      }
    });

    let xDataKeys = Object.keys(xData);
    retData.options.low = 0;
    retData.options.high = maxCodeUsed + 5;

    for (let i = 0; i <= 7; i++) {
      if (xDataKeys.includes(i + "")) {
        if (i != 0) retData.data.labels.push(dayToLabel[xData[i + ""].day]);
        retData.data.series[3].push(xData[i + ""].count);
      } else {
        if (i != 0)
          retData.data.labels.push(
            dayToLabel[new Date(currDate.getTime() - i * dayToMS).getDay()]
          );
        retData.data.series[3].push(0);
      }
    }

    retData.data.labels = retData.data.labels.reverse();
    retData.data.series[3] = retData.data.series[3].reverse();

    return retData;
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>PromoCodes : Used</h4>
          <p className="category">PromoCodes used over last 7 days</p>
        </div>
        <div className="content">
          {this.props.promoCodeLogs ? (
            <ReactChartist
              data={this.getChartData().data}
              options={this.getChartData().options}
              type="Line"
              className="ct-chart"
            />
          ) : (
            <div className="chart-preload">
              <div>
                <i className="fa fa-cogs fa-5x" aria-hidden="true" />
              </div>
              Loading
            </div>
          )}
        </div>
      </div>
    );
  }
}

function mapsStateToProps({ promoCodeLogs }) {
  return { promoCodeLogs };
}

export default connect(mapsStateToProps)(PromoCodeUsed);
