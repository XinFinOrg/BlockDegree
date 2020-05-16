import React, { Component } from "react";
import { AoaToSheet } from "../../../helpers/common";
import { connect } from "react-redux";

class DownloadUserEmailList extends Component {
  constructor(props) {
    super(props);

    this.handleDownloadClick = this.handleDownloadClick.bind(this);
  }

  handleDownloadClick() {
    if (!this.props.allUsers) {
      return;
    }
    const allUsers = this.props.allUsers.users;
    const aoa = [["id", "email-id", "name", "certified"]];
    for (let i = 0; i < allUsers.length; i++) {
      let currUser = allUsers[i];
      aoa.push([
        `${i + 1}`,
        currUser.email,
        currUser.name,
        currUser.examData.certificateHash.length > 1 ? "yes" : "no",
      ]);
    }

    AoaToSheet(aoa, "UserEmailList");
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Download User Email List</h4>
        </div>
        <div className="content">
          <button
            type="button"
            onClick={this.handleDownloadClick}
            className="btn btn-fill btn-info"
          >
            Download
          </button>
        </div>
      </div>
    );
  }
}

function mapsStateToProps({ allUsers }) {
  return { allUsers };
}

export default connect(mapsStateToProps, null)(DownloadUserEmailList);
