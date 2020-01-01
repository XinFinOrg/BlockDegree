import React, { Component } from "react";
import Chart from "react-chartist";
import { connect } from "react-redux";


let data = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  series: [
    [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
    [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695],
    [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
  ]
};

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

let options = {
  seriesBarDistance: 10,
  axisX: {
    showGrid: false
  },
  height: "245px"
};

let responsiveOptions = [
  [
    "screen and (max-width: 640px)",
    {
      seriesBarDistance: 5,
      axisX: {
        labelInterpolationFnc: function(value) {
          return value[0];
        }
      }
    }
  ]
];

class CertificateBar extends Component {
  getCertificateData() {
    let certCount = {};

    let course_1_Arr = [],
      course_2_Arr = [],
      course_3_Arr = [];
    let labels = [];

    const _allUsers = this.props.allUsers.users;
    _allUsers.forEach(user => {
      if (user.examData.certificateHash.length > 0) {
        for (let i = 1; i < user.examData.certificateHash.length; i++) {
          const currDate = new Date(
            parseFloat(user.examData.certificateHash[i].timestamp)
          );
          const currYear = currDate.getFullYear().toString();
          const currMonth = currDate.getMonth().toString();
          const currExamType = user.examData.certificateHash[i].examType;
          if (Object.keys(certCount).includes(currYear)) {
            if (Object.keys(certCount[currYear]).includes(currMonth)) {
              //   certCount[currYear][currMonth]++;
              if (
                Object.keys(certCount[currYear][currMonth]).includes(
                  currExamType
                )
              ) {
                certCount[currYear][currMonth][currExamType]++;
              } else {
                certCount[currYear][currMonth][currExamType] = 1;
              }
            } else {
              certCount[currYear][currMonth] = {};
              certCount[currYear][currMonth][currExamType] = 1;
            }
          } else {
            certCount[currYear] = {};
            certCount[currYear][currMonth] = {};
            certCount[currYear][currMonth][currExamType] = 1;
          }
        }
      }
    });
    console.log("CERT COUNT::");
    console.log(certCount);

    const currDate = new Date();
    let currYear = currDate.getFullYear().toString();
    let currMonth = currDate.getMonth().toString();
    let offset = 0;
    for (let x = 0; x < 12; x++) {
      if (parseInt(currMonth) - offset < 0) {
        currYear = (parseInt(currYear) - 1).toString();
        currMonth="11";
        offset = 0;
      }
      if (
        Object.keys(certCount).includes(currYear) &&
        Object.keys(certCount[currYear]).includes(
          (currMonth - offset).toString()
        )
      ) {
        course_1_Arr.push(
          certCount[currYear][(currMonth - offset).toString()][
            "basic"
          ]
            ? certCount[currYear][(currMonth - offset).toString()][
                "basic"
              ]
            : 0
        );
        course_2_Arr.push(
          certCount[currYear][(currMonth - offset).toString()][
            "advanced"
          ]
            ? certCount[currYear][(currMonth - offset).toString()][
                "advanced"
              ]
            : 0
        );
        course_3_Arr.push(
          certCount[currYear][(currMonth - offset).toString()][
            "professional"
          ]
            ? certCount[currYear][(currMonth - offset).toString()][
                "professional"
              ]
            : 0
        );
        labels.push(
          months[(currMonth - offset).toString()] +
            "'" +
            currYear.slice(2)
        );
        offset++;
      } else {
        // all entry 0
        course_1_Arr.push(0);
        course_2_Arr.push(0);
        course_3_Arr.push(0);
        labels.push(
          months[(currMonth - offset).toString()] +
            "'" +
            currYear.slice(2)
        );
        offset++;
      }
    }
    course_1_Arr.reverse();
    course_2_Arr.reverse();
    course_3_Arr.reverse();
    labels.reverse();
    console.log("BAR ARR");
    console.log(course_1_Arr, course_2_Arr, course_3_Arr, labels);

    return {
      labels: labels,
      series: [course_1_Arr, course_2_Arr, course_3_Arr]
    };
  }

  render() {
    return (
      <div>
        <div className="card ">
          <div className="header">
            <h4 className="title">Certificates</h4>
            <p className="category">Certificates issued over last 12 months</p>
          </div>
          <div className="content">
            {this.props.allUsers ? (
              <Chart
                data={this.getCertificateData()}
                options={options}
                responsiveOptions={responsiveOptions}
                type="Bar"
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
      </div>
    );
  }
}

function mapsStateToProps({ allUsers }) {
  return { allUsers };
}

export default connect(mapsStateToProps)(CertificateBar);
