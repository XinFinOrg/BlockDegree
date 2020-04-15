import React, { Component } from "react";

import AddCourse from "./AddCourse";
import DisableBurn from "./DisableBurn";
import EnableBurn from "./EnableBurn";
import SetBurnPercent from "./SetBurnPercent";
import SetConXDC from "./SetConXDC";
import SetConXDCe from "./SetConXDCe";
import SetPriceUsd from "./SetPriceUsd";
import SetTolXDC from "./SetTolXDC";
import SetTolXDCe from "./SetTolXDCe";
import ForceBurn from "./ForceBurn";
import ForceBurnFMD from "./ForceBurnFMD";

class CoursePayment extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-7">
            <AddCourse />
          </div>
          <div className="col-md-5">
            <EnableBurn />
          </div>
          <div className="col-md-5">
            <DisableBurn />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <SetConXDC />
          </div>
          <div className="col-md-6">
            <SetConXDCe />
          </div>
          <div className="col-md-6">
            <SetTolXDC />
          </div>
          <div className="col-md-6">
            <SetTolXDCe />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <SetBurnPercent />
          </div>
          <div className="col-md-6">
            <SetPriceUsd />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <ForceBurn />
          </div>
          <div className="col-md-6">
            <ForceBurnFMD />
          </div>
        </div>
      </div>
    );
  }
}

export default CoursePayment;
