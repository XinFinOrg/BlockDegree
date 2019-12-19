import React from "react";
import { Route, Router } from "react-router-dom";
import { connect } from "react-redux";
import cx from "classnames";
import { setMobileNavVisibility } from "../../reducers/Layout";
import { withRouter } from "react-router-dom";

import ReactNotification from "react-notifications-component";

import "react-notifications-component/dist/theme.css";

import Header from "./Header";
import SideBar from "../../components/SideBar";

/**
 * Pages
 */
// import Dashboard from "../Dashboard";
// import Components from "../Components";
// import UserProfile from "../UserProfile";
// import MapsPage from "../MapsPage";
// import Forms from "../Forms";
// import Charts from "../Charts";
// import Calendar from "../Calendar";
// import Tables from "../Tables";

import DashboardNew from "../../components/Dashboard";
import NewTable from "../../components/Tables";
import Functionalities from "../../components/Functionalities";
import TxLogs from "../../components/TxLogs";
import WeeklyStats from "../../components/WeeklyCharts";

const Main = ({ mobileNavVisibility, hideMobileMenu, history }) => {
  history.listen(() => {
    if (mobileNavVisibility === true) {
      hideMobileMenu();
    }
  });
  return (
    <div
      className={cx({
        "nav-open": mobileNavVisibility === true
      })}
    >
      <div className="wrapper">
        <div className="close-layer" onClick={hideMobileMenu}></div>
        <SideBar />
        <ReactNotification />

        <div className="main-panel">
          <Header />
          <Route exact path="/" component={DashboardNew} />
          <Route path="/tables" component={NewTable} />
          <Route path="/functionalities" component={Functionalities} />
          <Route path="/txlogs" component={TxLogs} />
          <Route path="/weekly-stats" component={WeeklyStats} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProp = state => ({
  mobileNavVisibility: state.Layout.mobileNavVisibility
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  hideMobileMenu: () => dispatch(setMobileNavVisibility(false))
});

export default withRouter(connect(mapStateToProp, mapDispatchToProps)(Main));
