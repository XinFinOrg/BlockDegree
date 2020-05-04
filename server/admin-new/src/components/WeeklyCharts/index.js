import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions/index";

import Certificates from "./Certificates";
import AccountsCreated from "./AccountCreated";
import AccountActive from "./AccountActive";
import PromoCodeUsed from "./PromoCodeUsed";
import CourseTraffic from "./CourseTraffic";
import FMD from "./FMD";

class WeeklyStats extends Component {
  componentDidMount() {
    this.props.fetchAllFunds();
  }

  renderContent() {
    return (
      <div>
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6">
                <Certificates />
              </div>
              <div className="col-md-6">
                <AccountsCreated />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <AccountActive />
              </div>
              <div className="col-md-6">
                <CourseTraffic />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <PromoCodeUsed />
              </div>
              <div className="col-md-6">
                <FMD />
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

export default connect(mapsStateToProps, actions)(WeeklyStats);
