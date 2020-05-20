import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../actions/index";

import DashboardPublic from "../components/DashboardPublic";
import DashboardPrivate from "../components/DashboardPrivate/index";
import { log } from "handlebars";

class DashboardContainer extends Component {
  constructor(props) {
    super(props);

    this.renderAccordingToLatest = this.renderAccordingToLatest.bind(this);
  }

  componentWillMount() {
    this.props.fetchCorporateUser();
  }

  renderAccordingToLatest() {
    const initialAuth = localStorage.getItem("corp-auth-status");
    const initialAuthTS = localStorage.getItem("corp-auth-t");

    if (this.props.auth) {
      const { fetchedTS } = this.props.auth;
      if (parseFloat(fetchedTS) > parseFloat(initialAuthTS)) {
        return this.props.auth.auth === true ? (
          <DashboardPrivate />
        ) : (
          <DashboardPublic />
        );
      }
    }
    return initialAuth == "true" ? <DashboardPrivate /> : <DashboardPublic />;
  }

  render() {
    return <div className="main-panel">{this.renderAccordingToLatest()}</div>;
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, actions)(DashboardContainer);
