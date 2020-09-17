import React from "react";
import { Route } from "react-router-dom";

import Users from "./Users";
import Promocodes from "./PromoCodes";
import RefererCodes from "./ReferralCodes";
import Certificates from "./Certificates";
import UserSessions from "./UserSessions";

const Tables = ({ match }) => (
  <div className="content">
    <Route path={`${match.url}/users`} component={Users} />
    <Route path={`${match.url}/promocodes`} component={Promocodes} />
    <Route path={`${match.url}/certificates`} component={Certificates} />
    <Route path={`${match.url}/referrer-codes`} component={RefererCodes} />
    <Route path={`${match.url}/user-sessions`} component={UserSessions} />
  </div>
);

export default Tables;
