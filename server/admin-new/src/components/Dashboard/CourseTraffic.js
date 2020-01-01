import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import { connect } from "react-redux";
import Chartist from "chartist";

// let dataSales = {
//   labels: ["1", "2", "3", "4", "5", "6"],
//   series: [
//     [0, 385, 490, 492, 554, 586, 586],
//     [0, 152, 143, 240, 287, 335, 586],
//     [0, 113, 67, 108, 190, 239, 586]
//   ]
// };

// curri-blockchain-basic
// curri-blockchain-advanced
// curri-blockchain-professional

// basic
// advanced
// professional

let responsiveTraffic = [
  [
    "screen and (max-width: 640px)",
    {
      axisX: {
        labelInterpolationFnc: function(value) {
          return value[0];
        }
      }
    }
  ]
];

const months = {
  "0": "Jan",
  "1": "Feb",
  "2": "Mar",
  "3": "Apr",
  "4": "May",
  "5": "Jun",
  "6": "Jul",
  "7": "Aug",
  "8": "Sep",
  "9": "Oct",
  "10": "Nov",
  "11": "Dec"
};

class TrafficChart extends Component {
  visitCap = 0;

  getOptionsTraffic = visitCap => {
    return {
      low: 0,
      high: visitCap,
      showArea: true,
      height: "245px",
      axisX: {
        showGrid: false
      },
      lineSmooth: Chartist.Interpolation.simple({
        divisor: 5
      }),
      showLine: false,
      showPoint: false
    };
  };

  getCourseTraffic = () => {
    console.log("called getCourseTraffic");

    let course_1_stats = {};
    let course_2_stats = {};
    let course_3_stats = {};

    const allVisits = this.props.courseVisits.visits;
    let maxVisit = 0;

    // As per the last 30 days.

    // allVisits.forEach(visit => {
    //   let currTS = Date.now();
    //   const monthToMS = 30 * 24 * 60 * 60 * 1000;
    //   for (let i = 1; i <= 7; i++) {
    //     currTS = currTS - monthToMS * i;
    //     if (parseFloat(visit.lastVisit) - currTS >= 0) {
    //       // found in the proper TS
    //       switch (visit.course) {
    //         case "basic": {
    //           course_1_stats[i + ""]++;
    //           course_1_stats[i + ""] > maxVisit
    //             ? (maxVisit = course_1_stats[i + ""])
    //             : (maxVisit = maxVisit);
    //           break;
    //         }
    //         case "advanced": {
    //           course_2_stats[i + ""]++;
    //           course_2_stats[i + ""] > maxVisit
    //             ? (maxVisit = course_2_stats[i + ""])
    //             : (maxVisit = maxVisit);
    //           break;
    //         }
    //         case "professional": {
    //           course_3_stats[i + ""]++;
    //           course_3_stats[i + ""] > maxVisit
    //             ? (maxVisit = course_3_stats[i + ""])
    //             : (maxVisit = maxVisit);
    //           break;
    //         }
    //         default:
    //           break;
    //       }
    //       break;
    //     }
    //   }
    // });

    allVisits.forEach(visit => {
      // const currTS = new Date();
      const visitDate = new Date(parseFloat(visit.lastVisit));
      let visitMonth = visitDate.getMonth();
      visitMonth = visitMonth.toString();
      let visitYear = visitDate.getFullYear();
      visitYear = visitYear.toString();

      // const currMonth = currTS.getMonth();
      // const currYear = currTS.getFullYear();
      switch (visit.course) {
        case "basic": {
          if (Object.keys(course_1_stats).includes(visitYear)) {
            if (Object.keys(course_1_stats[visitYear]).includes(visitMonth)) {
              course_1_stats[visitYear][visitMonth]++;
              if (course_1_stats[visitYear][visitMonth] > maxVisit)
                maxVisit = course_1_stats[visitYear][visitMonth];
            } else {
              course_1_stats[visitYear][visitMonth] = 1;
              if (course_1_stats[visitYear][visitMonth] > maxVisit)
                maxVisit = course_1_stats[visitYear][visitMonth];
            }
          } else {
            course_1_stats[visitYear] = {};
            course_1_stats[visitYear][visitMonth] = 1;
            if (course_1_stats[visitYear][visitMonth] > maxVisit)
              maxVisit = course_1_stats[visitYear][visitMonth];
          }
          break;
        }
        case "advanced": {
          if (Object.keys(course_2_stats).includes(visitYear)) {
            if (Object.keys(course_2_stats[visitYear]).includes(visitMonth)) {
              course_2_stats[visitYear][visitMonth]++;
              if (course_2_stats[visitYear][visitMonth] > maxVisit)
                maxVisit = course_2_stats[visitYear][visitMonth];
            } else {
              course_2_stats[visitYear][visitMonth] = 1;
              if (course_2_stats[visitYear][visitMonth] > maxVisit)
                maxVisit = course_2_stats[visitYear][visitMonth];
            }
          } else {
            course_2_stats[visitYear] = {};
            course_2_stats[visitYear][visitMonth] = 1;
            if (course_2_stats[visitYear][visitMonth] > maxVisit)
              maxVisit = course_2_stats[visitYear][visitMonth];
          }
          break;
        }
        case "professional": {
          if (Object.keys(course_3_stats).includes(visitYear)) {
            if (Object.keys(course_3_stats[visitYear]).includes(visitMonth)) {
              course_3_stats[visitYear][visitMonth]++;
              if (course_3_stats[visitYear][visitMonth] > maxVisit)
                maxVisit = course_3_stats[visitYear][visitMonth];
            } else {
              course_3_stats[visitYear][visitMonth] = 1;
              if (course_3_stats[visitYear][visitMonth] > maxVisit)
                maxVisit = course_3_stats[visitYear][visitMonth];
            }
          } else {
            course_3_stats[visitYear] = {};
            course_3_stats[visitYear][visitMonth] = 1;
            if (course_3_stats[visitYear][visitMonth] > maxVisit)
              maxVisit = course_3_stats[visitYear][visitMonth];
          }
          break;
        }
        default:
          break;
      }
    });

    console.log(course_1_stats, course_2_stats, course_3_stats);
    console.log("max visit: ", maxVisit);
    this.visitCap = maxVisit;
    const currDate = new Date();
    let currMonth = currDate.getMonth().toString();
    let currYear = currDate.getFullYear().toString();

    const course_1_Arr = [];
    const course_2_Arr = [];
    const course_3_Arr = [];

    const labels = [];

    let offset = 0;
    for (let x = 0; x <= 6; x++) {
      if (parseInt(currMonth) - offset < 0) {
        currYear = (parseInt(currYear) - 1).toString();
        currMonth = "" + 11;
        offset = 0;
      }
      if (
        Object.keys(course_1_stats).includes(currYear) &&
        Object.keys(course_1_stats[currYear]).length > 0 &&
        Object.keys(course_1_stats[currYear]).includes(
          (parseInt(currMonth) - offset).toString()
        )
      ) {
        course_1_Arr.push(
          course_1_stats[currYear][(parseInt(currMonth) - offset).toString()]
        );
        labels.push(
          months[(parseInt(currMonth) - offset).toString()] +
            "'" +
            currYear.slice(2)
        );
        offset++;
      } else {
        course_1_Arr.push(0);
        labels.push(
          months[(parseInt(currMonth) - offset).toString()] +
            "'" +
            currYear.slice(2)
        );
        offset++;
      }
    }

    offset = 0;
    currYear = currDate.getFullYear().toString();
    currMonth = currDate.getMonth().toString();

    for (let x = 0; x <= 6; x++) {
      if (parseInt(currMonth) - offset <= 0) {
        currYear = (parseInt(currYear) - 1).toString();
        currMonth="11";
        offset = 0;
      }
      if (
        Object.keys(course_2_stats).includes(currYear) &&
        Object.keys(course_2_stats[currYear]).length > 0 &&
        Object.keys(course_2_stats[currYear]).includes(
          (parseInt(currMonth) - offset).toString()
        )
      ) {
        course_2_Arr.push(
          course_2_stats[currYear][(parseInt(currMonth) - offset).toString()]
        );
        offset++;
      } else {
        course_2_Arr.push(0);
        offset++;
      }
    }

    offset = 0;
    currYear = currDate.getFullYear().toString();
    currMonth = currDate.getMonth().toString();
    for (let x = 0; x <= 6; x++) {
      if (parseInt(currMonth) - offset <= 0) {
        currYear = (parseInt(currYear) - 1).toString();
        currMonth="11";
        offset = 0;
      }
      if (
        Object.keys(course_3_stats).includes(currYear) &&
        Object.keys(course_3_stats[currYear]).length > 0 &&
        Object.keys(course_3_stats[currYear]).includes(
          (parseInt(currMonth) - offset).toString()
        )
      ) {
        course_3_Arr.push(
          course_3_stats[currYear][(parseInt(currMonth) - offset).toString()]
        );
        offset++;
      } else {
        course_3_Arr.push(0);
        offset++;
      }
    }

    course_1_Arr.reverse();
    course_2_Arr.reverse();
    course_3_Arr.reverse();
    labels.reverse();

    // console.log(Object.keys(course_1_stats[currYear]));
    // if (Object.keys(course_1_stats[currYear]).length > 0) {
    //   // has months
    //   for (let x=11;x>=0;x--) {
    //     // in descending order
    //     console.log("inside loop");
    //     if (Object.keys(course_1_stats[currYear]).includes(x+"")){
    //       console.log("inside loop loop");
    //       course_1_Arr.push(course_1_stats[currYear][x+""]);
    //     }
    //   }
    // };

    // console.log(course_1_Arr);

    // for (let i = 11; i >= 3; i--) {
    //   course_1_Arr.push(course_1_stats[i + ""]);
    //   course_2_Arr.push(course_2_stats[i + ""]);
    //   course_3_Arr.push(course_3_stats[i + ""]);
    // }
    return {
      labels: labels.slice(0, labels.length - 1),
      series: [course_1_Arr, course_2_Arr, course_3_Arr]
    };
  };
  render() {
    return (
      <div className="card">
        <div className="header">
          <h4 className="title">Course Traffic</h4>
          <p className="category">All Course Traffic ( Past Six Months )</p>
        </div>
        <div className="content">
          {this.props.courseVisits ? (
            <ChartistGraph
              data={this.getCourseTraffic()}
              options={this.getOptionsTraffic(this.visitCap)}
              responsiveOptions={responsiveTraffic}
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
        <div className="footer">
          <div className="legend">
            <div className="item">
              <i className="fa fa-circle text-info"></i> Basic
            </div>
            <div className="item">
              <i className="fa fa-circle text-danger"></i> Advanced
            </div>
            <div className="item">
              <i className="fa fa-circle text-warning"></i> Professional
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapsStateToProps({ courseVisits }) {
  return { courseVisits };
}

export default connect(mapsStateToProps)(TrafficChart);
