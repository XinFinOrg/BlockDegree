import React, { Component } from "react";
import DownloadUserEmailList from "./DownloadUserEmailList";

class SiteStatistics extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-4">
            <DownloadUserEmailList />
          </div>
        </div>
      </div>
    );
  }
}

export default SiteStatistics;
