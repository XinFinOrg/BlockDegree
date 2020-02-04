import React from "react";
import { Route } from "react-router-dom";

import Users from "./Users";
import Promocodes from "./PromoCodes";
import RefererCodes from "./ReferralCodes";
import Certificates from "./Certificates";

const Tables = ({ match }) => (
  <div className="content">
    <Route path={`${match.url}/users`} component={Users} />
    <Route path={`${match.url}/promocodes`} component={Promocodes} />
    <Route path={`${match.url}/certificates`} component={Certificates} />
    <Route path={`${match.url}/referrer-codes`} component={RefererCodes} />
  </div>
);

export default Tables;
