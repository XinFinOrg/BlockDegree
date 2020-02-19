import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
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

class CourseTraffic extends Component {
  getChartData() {
    const visits = this.props.courseVisits.visits;
    console.log("Accounts Created : ", visits.length);
    let maxCnt = 0;
    let xData = {};
    let currDate = new Date();
    let retData = {
      data: {
        labels: [],
        series: [[], [], [], [], [], [], []]
      },
      options: {
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
    visits.forEach(visit => {
      if (!visit.lastVisit) {
        return;
      }
      let currlastVisit = parseFloat(visit.lastVisit);
      if (parseFloat(currlastVisit) > currDate.getTime() - 0 * dayToMS) {
        // falls in valid ts
        if (Object.keys(xData).includes("0")) {
          xData[0 + ""]["count"]++;
          if (xData[0 + ""]["count"] > maxCnt) {
            maxCnt = xData[0 + ""]["count"];
          }
        } else {
          xData["0"] = {};
          xData["0"]["count"] = 1;
          xData["0"]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 1 * dayToMS) {
        if (Object.keys(xData).includes(1 + "")) {
          xData[1 + ""]["count"]++;
          if (xData[1 + ""]["count"] > maxCnt) {
            maxCnt = xData[1 + ""]["count"];
          }
        } else {
          xData[1 + ""] = {};
          xData[1 + ""]["count"] = 1;
          xData[1 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 2 * dayToMS) {
        console.log("day 2", new Date(currlastVisit));
        if (Object.keys(xData).includes(2 + "")) {
          xData[2 + ""]["count"]++;
          if (xData[2 + ""]["count"] > maxCnt) {
            maxCnt = xData[2 + ""]["count"];
          }
        } else {
          xData[2 + ""] = {};
          xData[2 + ""]["count"] = 1;
          xData[2 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 3 * dayToMS) {
        if (Object.keys(xData).includes(3 + "")) {
          xData[3 + ""]["count"]++;
          if (xData[3 + ""]["count"] > maxCnt) {
            maxCnt = xData[3 + ""]["count"];
          }
        } else {
          xData[3 + ""] = {};
          xData[3 + ""]["count"] = 1;
          xData[3 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 4 * dayToMS) {
        if (Object.keys(xData).includes(4 + "")) {
          xData[4 + ""]["count"]++;
          if (xData[4 + ""]["count"] > maxCnt) {
            maxCnt = xData[4 + ""]["count"];
          }
        } else {
          xData[4 + ""] = {};
          xData[4 + ""]["count"] = 1;
          xData[4 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 5 * dayToMS) {
        if (Object.keys(xData).includes(5 + "")) {
          xData[5 + ""]["count"]++;
          if (xData[5 + ""]["count"] > maxCnt) {
            maxCnt = xData[5 + ""]["count"];
          }
        } else {
          xData[5 + ""] = {};
          xData[5 + ""]["count"] = 1;
          xData[5 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 6 * dayToMS) {
        if (Object.keys(xData).includes(6 + "")) {
          xData[6 + ""]["count"]++;
          if (xData[6 + ""]["count"] > maxCnt) {
            maxCnt = xData[6 + ""]["count"];
          }
        } else {
          xData[6 + ""] = {};
          xData[6 + ""]["count"] = 1;
          xData[6 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      } else if (currlastVisit > currDate.getTime() - 7 * dayToMS) {
        if (Object.keys(xData).includes(7 + "")) {
          xData[7 + ""]["count"]++;
          if (xData[7 + ""]["count"] > maxCnt) {
            maxCnt = xData[7 + ""]["count"];
          }
        } else {
          xData[7 + ""] = {};
          xData[7 + ""]["count"] = 1;
          xData[7 + ""]["day"] = new Date(currlastVisit).getDay();
        }
      }
    });

    let xDataKeys = Object.keys(xData);
    retData.options.low = 0;
    retData.options.high = maxCnt + 5;

    for (let i = 0; i <= 7; i++) {
      if (xDataKeys.includes(i + "")) {
        if (i !== 0) retData.data.labels.push(dayToLabel[xData[i + ""].day]);
        retData.data.series[6].push(xData[i + ""].count);
      } else {
        if (i !== 0)
          retData.data.labels.push(
            dayToLabel[new Date(currDate.getTime() - i * dayToMS).getDay()]
          );
        retData.data.series[6].push(0);
      }
    }

    retData.data.labels = retData.data.labels.reverse();
    retData.data.series[6] = retData.data.series[6].reverse();

    return retData;
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Course / Curriculum Visits</h4>
          <p className="category">
            Unique visit count for Course Curriculum & Course Content
          </p>
        </div>
        <div className="content">
          {this.props.courseVisits ? (
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
        <hr />
        {this.props.courseVisits ? (
          <div className="weekly-updated">
            <i className="fa fa-history"></i> Updated at{" "}
            <strong>
              {new Date(this.props.courseVisits.fetchedTS).getHours() +
                ":" +
                new Date(this.props.courseVisits.fetchedTS).getMinutes()}
            </strong>{" "}
            Hours
            <div
              onClick={() => {
                this.props.fetchCourseVisits();
              }}
              className="right chart-refresh-btn"
            >
              <i class="fa fa-refresh" aria-hidden="true"></i>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

function mapsStateToProps({ courseVisits }) {
  return { courseVisits };
}

export default connect(mapsStateToProps, actions)(CourseTraffic);
