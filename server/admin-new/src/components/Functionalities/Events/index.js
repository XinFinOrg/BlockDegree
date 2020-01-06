import React, { Component } from "react";

import GenerateEventTS from "./GenerateEventTS";
import GenerateEventVar from "./GenerateEventVar";
import AddPostTemplate from "./AddPostTemplate";

class PromoCodeForms extends Component {
  render() {
    return (
      <div>
        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <GenerateEventTS />
          </div>
          <div className="col-md-6">
            <GenerateEventVar />
          </div>
        </div>

        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <AddPostTemplate />
          </div>
        </div>
      </div>
    );
  }
}

export default PromoCodeForms;
