import React from "react";
import { Route } from "react-router-dom";


import Promocode from "./PromoCode/index"; 
import ReferralCode from "./ReferralCode/index";
import WalletConfig from "./WalletConfig/index";
import CoursePayment from "./CoursePayment/index";



class Functionalities extends React.Component{
  render(){
    return (
      <div className="content">
        <Route path={`${this.props.match.url}/promocodes`} component={Promocode} />
        <Route path={`${this.props.match.url}/referral-codes`} component={ReferralCode} />
        <Route path={`${this.props.match.url}/wallet-config`} component={WalletConfig} />
        <Route path={`${this.props.match.url}/course-payment`} component={CoursePayment} />
      </div>
    );
  }
} 

export default Functionalities;
