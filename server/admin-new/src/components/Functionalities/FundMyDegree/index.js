import React, { Component } from "react";

import SendTokensToAdmin from "./SendTokensToAdmin";

class FundMyDegree extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <SendTokensToAdmin />
          </div>
        </div>
      </div>
    );
  }
}

export default FundMyDegree;
