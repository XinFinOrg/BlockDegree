import React, { Component } from "react";

import AddPromoCode from "./AddCode";
import EnablePromoCode from "./EnableCode";
import DisablePromoCode from "./DisableCode";
import RestrictPromoCode from "./RestrictCode";
import UnrestrictPromoCode from "./UnrestrictCode";
import AddUser from "./AddUser";
import CodeCap from "./SetCodeCap";
import CodeLimit from "./SetCapLimit";

class PromoCodeForms extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <AddPromoCode />
          </div>
          <div className="col-md-6">
            <EnablePromoCode />
          </div>
          <div className="col-md-6">
            <DisablePromoCode />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <AddUser />
          </div>
          <div className="col-md-6">
            <RestrictPromoCode />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <UnrestrictPromoCode />
          </div>
          <div className="col-md-4">
            <CodeCap />
          </div>
          <div className="col-md-4">
            <CodeLimit />
          </div>
        </div>
      </div>
    );
  }
}

export default PromoCodeForms;
