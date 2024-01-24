import React, { Component } from "react";
import { connect } from "react-redux";
import ChartistGraph from "react-chartist";
import * as actions from "../../actions";

class CertificateStats extends Component {
  state = {
    course_1: 0,
    course_2: 0,
    course_3: 0,
    course_4: 0,  // New course
    course_5: 0,  // New course
    course_6: 0,  // New course
    loaded: false
  };

  dataPreferences = () => {
    let total =
      this.state.course_1 +
      this.state.course_2 +
      this.state.course_3 +
      this.state.course_4 +
      this.state.course_5 +
      this.state.course_6;
      let r_c1 = Math.round((this.state.course_1 * 100) / total);
      let r_c2 = Math.round((this.state.course_2 * 100) / total);
      let r_c3 = Math.round((this.state.course_3 * 100) / total);
      let r_c4 = Math.round((this.state.course_4 * 100) / total);  // New course
      let r_c5 = Math.round((this.state.course_5 * 100) / total);  // New course
      let r_c6 = Math.round((this.state.course_6 * 100) / total);  // New course
      return {
        labels: [r_c1 + "%", r_c2 + "%", r_c3 + "%", r_c4 + "%", r_c5 + "%", r_c6 + "%"],  // Adjusted labels
        series: [r_c1, r_c2, r_c3, r_c4, r_c5, r_c6]  // Adjusted series
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
    let c1 = 1,
      c2 = 1,
      c3 = 1,
      c4 = 1,  // New course
      c5 = 1,  // New course
      c6 = 1;  // New course
    users.forEach(user => {
      console.log('user.examData',user.examData);
      if (user != null && user.examData.certificateHash.length > 1) {
        console.log('user.examData.certificateHash',user.examData.certificateHash);
  
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
            case "examComputing": {  // New course
              c4++;
              break;
            }
            case "examWallet": {  // New course
              c5++;
              break;
            }
            case "examXdcNetwork": {  // New course
              c6++;
              break;
            }
            default:
              break;
          }
        }
      }
    });
    console.log(c1,c2 ,c3, c4, c5, c6);
    console.log('c1', c1);
    let total = c1 + c2 + c3 + c4 + c5 + c6;
    let r_c1 = Math.round((c1 * 1000) / total) / 10;
    let r_c2 = Math.round((c2 * 1000) / total) / 10;
    let r_c3 = Math.round((c3 * 1000) / total) / 10;
    let r_c4 = Math.round((c4 * 1000) / total) / 10;  // New course
    let r_c5 = Math.round((c5 * 1000) / total) / 10;  // New course
    let r_c6 = Math.round((c6 * 1000) / total) / 10;  // New course
    return (
      <ChartistGraph
      data={{
        labels: [r_c1 + "", r_c2 + "", r_c3 + "", r_c4 + "", r_c5 + "", r_c6 + ""],  // Adjusted labels
        series: [r_c1, r_c2, r_c3, r_c4, r_c5, r_c6]  // Adjusted series
      }}
      options={this.optionsPreferences}
      type={this.chartType}
      className={"ct-chart ct-perfect-fourth"}
    />
  );
};

  chartType = "Pie";
  render() {
    console.log("Rendering CertificateStats with data:", this.props.allUsers);
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
              <div className="item">
                <i className="fa fa-circle text-purple"></i> ExamComputing
              </div>
              <div className="item">
                <i className="fa fa-circle text-green"></i> ExamWallet
              </div>
              <div className="item">
                <i className="fa fa-circle text-darkblue"></i> ExamXdcNetwork
              </div>
            </div>
            <hr />
            {this.props.allUsers?<div className="stats">
              <i className="fa fa-history"></i> Updated at{" "}
              <strong>
                {new Date(this.props.allUsers.fetchedTS).getHours() + ":" + new Date(this.props.allUsers.fetchedTS).getMinutes()}
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
            </div>:""}
            
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
