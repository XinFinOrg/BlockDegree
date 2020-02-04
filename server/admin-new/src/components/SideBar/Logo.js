import React, { Component } from "react";

class Logo extends Component {
  render() {
    return (
      <div className="brand">
        <div className="logo-wrapper">
          <a href="/">
            <img
              src="https://www.blockdegree.org/img/brand/blockdegree_white.png"
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
