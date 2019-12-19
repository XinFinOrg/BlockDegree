import React from "react";
import { Route } from "react-router-dom";

import PromoCodeLog from "./PromoCodeLog";
import BurnLog from "./BurnLog";
import PaymentLog from "./PaymentLog";
import CryptoLog from "./CryptoLog";

const Logs = ({ match }) => (
  <div className="content">
    <Route path={`${match.url}/promocode-logs`} component={PromoCodeLog} />
    <Route path={`${match.url}/payment-logs`} component={PaymentLog} />
    <Route path={`${match.url}/burn-logs`} component={BurnLog} />
    <Route path={`${match.url}/crypto-logs`} component={CryptoLog} />
  </div>
);

export default Logs;
