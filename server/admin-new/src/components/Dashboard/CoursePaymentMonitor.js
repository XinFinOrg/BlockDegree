import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions/index";

const initialState = {};

class CoursePaymentMonitor extends Component {
  constructor(props) {
    super(props);
    this.setState({ ...initialState });
  }

  componentDidMount() {
    this.props.fetchAllPaymentLog(); // load on table
    this.props.fetchAllCryptoLog();
  }

  componentWillReceiveProps(nextProps) {
    const cryptoLogs = nextProps.cryptoLogs ? nextProps.cryptoLogs.logs : [];
    const paymentLogs = nextProps.paymentLogs ? nextProps.paymentLogs.logs : [];
    let paymentUsd = 0;
    for (let i = 0; i < paymentLogs.length; i++) {
      if (paymentLogs[i].payment_status === true) {
        paymentUsd += paymentLogs[i].payment_amount
          ? parseFloat(paymentLogs[i].payment_amount)
          : 9.99;
      }
    }
    console.log("Total Usd: ", paymentUsd);
  }

  render() {
    return (
      <div className="row course-payment-wrapper">
        <div className="col-md-4 col-sm-6">
          <div className="inner-card">
            <div className="inner-card__header">Total</div>
            <div className="inner-card__body">
              <div className="inner-card__body--label paypal">Paypal</div>
              <div className="inner-card__body--value ">${"10"}</div>
              <div className="inner-card__body--label fmd">XDC</div>
              <div className="inner-card__body--value">${"10"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="inner-card">
            <div className="inner-card__header">Direct</div>
            <div className="inner-card__body">
              <div className="inner-card__body--label paypal">Paypal</div>
              <div className="inner-card__body--value ">${"10"}</div>
              <div className="inner-card__body--label fmd">XDC</div>
              <div className="inner-card__body--value">${"10"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="inner-card">
            <div className="inner-card__header">FMD</div>
            <div className="inner-card__body">
              <div className="inner-card__body--label paypal">Paypal</div>
              <div className="inner-card__body--value ">${"10"}</div>
              <div className="inner-card__body--label fmd">XDC</div>
              <div className="inner-card__body--value">${"10"}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapsStateToProps({ cryptoLogs, paymentLogs }) {
  return { cryptoLogs, paymentLogs };
}

export default connect(mapsStateToProps, actions)(CoursePaymentMonitor);
