import React, { Component } from "react";

import ActivateAddr from "./ActivateAddr";
import AddAddr from "./AddAddr";

class WalletConfig extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <AddAddr />
          </div>
          <div className="col-md-6">
            <ActivateAddr />
          </div>
        </div>
      </div>
    );
  }
}

export default WalletConfig;
