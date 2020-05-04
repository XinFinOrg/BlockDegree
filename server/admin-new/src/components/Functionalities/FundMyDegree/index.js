import React, { Component } from "react";

import SendTokensToAdmin from "./SendTokensToAdmin";
import CompletionDateAuto from "./CompletionDateAuto";
import CompletionDateManual from "./CompletionDateManual";

class FundMyDegree extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <SendTokensToAdmin />
          </div>
          <div className="col-md-6">
            <CompletionDateAuto />
          </div>
          <div className="col-md-6">
            <CompletionDateManual />
          </div>
        </div>
      </div>
    );
  }
}

export default FundMyDegree;
