import React, { Component } from "react";
import { connect } from "react-redux";
import ChartistGraph from "react-chartist";
import * as actions from "../../actions";

class CertificateStats extends Component {
  state = {
    course_1: 0,
    course_2: 0,
    course_3: 0,
    loaded: false
  };

  dataPreferences = () => {
    let total = this.state.course_1 + this.state.course_2 + this.state.course_3;
    let r_c1 = Math.round((this.state.course_1 * 100) / total);
    let r_c2 = Math.round((this.state.course_2 * 100) / total);
    let r_c3 = Math.round((this.state.course_3 * 100) / total);
    return {
      labels: [r_c1 + "%", r_c2 + "%", r_c3 + "%"],
      series: [r_c1, r_c2, r_c3]
    };
  };

  optionsPreferences = {
    donut: false,
    donutWidth: 40,
    startAngle: 0,
    total: 100,
    showLabel: true,
    axisX: {
      showGrid: false,
      offset: 0
    },
    axisY: {
      offset: 0
    }
  };

  getCourseStats = () => {
    console.log("called get course stats");
    let users = this.props.allUsers.users;
    console.log("got the users");
    let c1 = 0,
      c2 = 0,
      c3 = 0;
    users.forEach(user => {
      if (user != null && user.examData.certificateHash.length > 1) {
        // has atleast one certificate
        let currUserCertificates = user.examData.certificateHash;
        for (let i = 1; i < currUserCertificates.length; i++) {
          let currCertificate = currUserCertificates[i];
          switch (currCertificate.examType) {
            case "basic": {
              c1++;
              break;
            }
            case "advanced": {
              c2++;
              break;
            }
            case "professional": {
              c3++;
              break;
            }
            default:
              break;
          }
        }
      }
    });
    console.log(c1, c2, c3);
    let total = c1 + c2 + c3;
    let r_c1 = Math.round((c1 * 1000) / total) / 10;
    let r_c2 = Math.round((c2 * 1000) / total) / 10;
    let r_c3 = Math.round((c3 * 1000) / total) / 10;
    return (
      <ChartistGraph
        data={{
          labels: [r_c1 + "", r_c2 + "", r_c3 + ""],
          series: [r_c1, r_c2, r_c3]
        }}
        options={this.optionsPreferences}
        type={this.chartType}
        className={"ct-chart ct-perfect-fourth"}
      />
    );
  };

  chartType = "Pie";
  render() {
    return (
      <div>
        <div className="card">
          <div className="header">
            <h4 className="title">Certificate Statistics</h4>
            <p className="category">
              Certificates issued across courses ( in % ).
            </p>
          </div>
          <div className="content">
            {this.props.allUsers ? (
              this.getCourseStats()
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
            <hr />
            <div className="stats">
              <i className="fa fa-history"></i> Updated at{" "}
              <strong>
                {new Date().getHours() + ":" + new Date().getMinutes()}
              </strong>{" "}
              Hours
              <div
                onClick={() => {
                  this.props.fetchAllUser();
                }}
                className="right chart-refresh-btn"
              >
                <i class="fa fa-refresh" aria-hidden="true"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ allUsers }) {
  return { allUsers };
}

export default connect(mapStateToProps, actions)(CertificateStats);
