import React, { Component } from "react";

import AddCode from "./AddCode";
import EnableCode from "./EnableCode";
import DisableCode from "./DisableCode";

class ReferralCode extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <AddCode />
          </div>
          <div className="col-md-6">
            <EnableCode />
          </div>
          <div className="col-md-6">
            <DisableCode />
          </div>
        </div>
      </div>
    );
  }
}

export default ReferralCode;
