import React from "react";
import { Route } from "react-router-dom";

import Promocode from "./PromoCode/index";
import ReferralCode from "./ReferralCode/index";
import WalletConfig from "./WalletConfig/index";
import CoursePayment from "./CoursePayment/index";
import Events from "./Events/index";
import FMD from "./FundMyDegree/index";

class Functionalities extends React.Component {
  render() {
    // prettier-ignore
    return (
      <div className="content" style={{overflowX:"hidden",  overflowY: "scroll"}}>
        <Route path={`${this.props.match.url}/promocodes`} component={Promocode} />
        <Route path={`${this.props.match.url}/referral-codes`} component={ReferralCode} />
        <Route path={`${this.props.match.url}/wallet-config`} component={WalletConfig} />
        <Route path={`${this.props.match.url}/course-payment`} component={CoursePayment} />
        <Route path={`${this.props.match.url}/events`} component={Events} />
        <Route path={`${this.props.match.url}/fmd`} component={FMD} />
      </div>
    );
  }
}

export default Functionalities;
