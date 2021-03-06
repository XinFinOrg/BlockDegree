import React from "react";
import { Route } from "react-router-dom";

import Users from "./Users";
import Promocodes from "./PromoCodes";
import RefererCodes from "./ReferralCodes";
import Certificates from "./Certificates";
import UserSessions from "./UserSessions";
import KycUser from "./KycUser";
import FundMyDegree from "./FundMyDegree";
import Referal from "./Referal";
import RazorPayLog from "./RazorPayLog";

const Tables = ({ match }) => (
  <div className="content">
    <Route path={`${ match.url }/users`} component={Users} />
    <Route path={`${ match.url }/promocodes`} component={Promocodes} />
    <Route path={`${ match.url }/certificates`} component={Certificates} />
    <Route path={`${ match.url }/referrer-codes`} component={RefererCodes} />
    <Route path={`${ match.url }/user-sessions`} component={UserSessions} />
    <Route path={`${ match.url }/kyc-user`} component={KycUser} />
    <Route path={`${ match.url }/fund-my-degree`} component={FundMyDegree} />
    <Route path={`${ match.url }/referals`} component={Referal} />
    <Route path={`${ match.url }/razor-pay-log`} component={RazorPayLog} />
  </div>
);

export default Tables;
