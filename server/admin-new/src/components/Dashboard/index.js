import React, { Component } from "react";
import { connect } from "react-redux";
import CertificatePie from "./CertificateChart";
import TrafficLine from "./CourseTraffic";
import CertificateBar from "./CertificateBar";

class DasnboardNew extends Component {
  renderContent() {
    return (
      <div>
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-5">
                <CertificatePie />
              </div>
              <div className="col-md-7">
                <TrafficLine />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <CertificateBar />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  render() {
    return <div>{this.renderContent()}</div>;
  }
}

function mapsStateToProps({ auth, courseVisits }) {
  return { auth, courseVisits };
}

export default connect(mapsStateToProps)(DasnboardNew);
