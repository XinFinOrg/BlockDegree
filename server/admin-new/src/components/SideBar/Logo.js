import React, { Component } from "react";
import BlockdegreeWhite from "../../assets/images/brand/blockdegree_white.png";

class Logo extends Component {
  render() {
    return (
      <div className="brand">
        <div className="logo-wrapper">
          <a href="/">
            <img
              src={BlockdegreeWhite}
              className="logo"
              alt="logo"
            />
          </a>
        </div>
        <div className="adminTag">ADMIN</div>
      </div>
    );
  }
}

export default Logo;
