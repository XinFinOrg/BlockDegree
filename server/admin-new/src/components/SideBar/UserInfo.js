import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";

class UserInfo extends Component {
  componentDidMount() {
    this.props.fetchUser();
    this.props.fetchCourseVisits();
    this.props.fetchAllUser();
    this.props.fetchAllPromoCodeLog();
  }

  state = {
    isShowingUserMenu: false
  };

  render() {
    let { auth } = this.props;
    // if (!auth || !auth.status){
    //   window.location.replace("https://www.blockdegree.org");
    // }
    return (
      <div className="user-wrapper">
        <div className="user">
          <div className="userinfo">
            <div className="username">
              {auth
                ? auth.status
                  ? "Welcome, " + auth.user.name
                  : "Not logged in"
                : "Not logged in"}
            </div>
            <div className="title">Admin</div>
          </div>
        </div>
      </div>
    );
  }
}

function mapsStateToProps({ auth, courseVisits }) {
  return { auth, courseVisits };
}

export default connect(mapsStateToProps, actions)(UserInfo);
