import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions/index";

const initialState = {
  totalUsd: "Loading",
  totalXdc: "Loading",
  courseUsd: "Loading",
  courseXdc: "Loading",
  fmdUsd: "Loading",
  fmdXdc: "Loading",
};

class CoursePaymentMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = { ...initialState };

    this.getDiscountedPrice = this.getDiscountedPrice.bind(this);
  }

  componentDidMount() {
    this.props.fetchAllPaymentLog(); // load on table
    this.props.fetchAllCryptoLog();
    this.props.fetchAllFunds();
    this.props.fetchXdcPrice();
  }

  componentWillReceiveProps(nextProps) {
    console.log("NEXT PROPS: ", nextProps);

    const cryptoLogs = nextProps.cryptoLogs ? nextProps.cryptoLogs.logs : [];
    const paymentLogs = nextProps.paymentLogs ? nextProps.paymentLogs.logs : [];
    const allFunds = nextProps.allFunds ? nextProps.allFunds.data : [];
    const xdcPrice = nextProps.xdcPrice ? nextProps.xdcPrice.data : null;
    // const allFunds = nextProps.allFunds?nextProps.allFunds.data:[];
    let courseUsd = 0,
      courseXdc = 0,
      fmdUsd = 0,
      fmdXdc = 0;
    for (let i = 0; i < paymentLogs.length; i++) {
      if (paymentLogs[i].payment_status === true) {
        console.log("TRUE: ", paymentLogs[i].payment_amount);

        courseUsd += paymentLogs[i].payment_amount
          ? parseFloat(paymentLogs[i].payment_amount)
          : 9.99;
      }
    }
    for (let i = 0; i < cryptoLogs.length; i++) {
      if (cryptoLogs[i].status === "completed") {
        courseXdc += parseFloat(cryptoLogs[i].tokenAmt);
      }
    }

    for (let i = 0; i < allFunds.length; i++) {
      if (allFunds[i].status === "completed") {
        if (allFunds[i].fundTx !== "") {
          fmdXdc += parseFloat(allFunds[i].amountReached);
        } else if (
          allFunds[i].paypalId !== "" &&
          allFunds[i].paypalId !== undefined
        ) {
          fmdUsd += parseFloat(allFunds[i].amountGoal);
        }
      }
    }

    console.log("Course Usd: ", courseUsd);
    console.log("Course XDC: ", courseXdc);

    console.log("FMD Usd: ", fmdUsd);
    console.log("FMD XDC: ", fmdXdc);

    if (xdcPrice === null) {
      //price not loaded
      this.setState({
        courseUsd: round2(courseUsd),
        courseXdc: "Loading",
        fmdUsd: round2(fmdUsd),
        fmdXdc: round6(fmdXdc),
        totalUsd: round2(courseUsd + fmdUsd),
        totalXdc: "Loading",
      });
    } else
      this.setState({
        courseUsd: round2(courseUsd),
        courseXdc: round6((courseXdc * xdcPrice) / Math.pow(10, 18)),
        fmdUsd: round2(fmdUsd),
        fmdXdc: round6(fmdXdc),
        totalUsd: round2(courseUsd + fmdUsd),
        totalXdc: round6((courseXdc * xdcPrice) / Math.pow(10, 18) + fmdXdc),
      });
    // console.log(allFunds);
  }

  getDiscountedPrice(principal, code) {
    console.log("called fetdiscountedprice: ", principal, code);

    if (!this.props.promoCodes) {
      return null;
    }
    if (code === "" || code === undefined || code === null) {
      return principal;
    }
    const { codes } = this.props.promoCodes;
    for (let i = 0; i < codes.length; i++) {
      if (codes[i].codeName === code) {
        const finalAmnt = parseFloat(principal) - parseFloat(codes[i].discAmnt);
        if (finalAmnt < 0) return 0;
        return finalAmnt;
      }
    }
    return principal;
  }

  render() {
    return (
      <div className="row course-payment-wrapper">
        <div className="col-md-4 col-sm-6">
          <div className="inner-card">
            <div className="inner-card__header">Total</div>
            <div className="inner-card__body">
              <div className="inner-card__body--label paypal">Paypal</div>
              <div className="inner-card__body--value ">
                $ {String(this.state.totalUsd).toLocaleString("en")}
              </div>
              <div className="inner-card__body--label fmd">XDC</div>
              <div className="inner-card__body--value">
                $ {String(this.state.totalXdc).toLocaleString("en")}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="inner-card">
            <div className="inner-card__header">Direct</div>
            <div className="inner-card__body">
              <div className="inner-card__body--label paypal">Paypal</div>
              <div className="inner-card__body--value ">
                $ {String(this.state.courseUsd).toLocaleString("en")}
              </div>
              <div className="inner-card__body--label fmd">XDC</div>
              <div className="inner-card__body--value">
                $ {String(this.state.courseXdc).toLocaleString("en")}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-sm-6">
          <div className="inner-card">
            <div className="inner-card__header">FMD</div>
            <div className="inner-card__body">
              <div className="inner-card__body--label paypal">Paypal</div>
              <div className="inner-card__body--value ">
                $ {String(this.state.fmdUsd).toLocaleString("en")}
              </div>
              <div className="inner-card__body--label fmd">XDC</div>
              <div className="inner-card__body--value">
                $ {String(this.state.fmdXdc).toLocaleString("en")}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapsStateToProps({
  cryptoLogs,
  paymentLogs,
  allFunds,
  xdcPrice,
  promoCodes,
}) {
  return { cryptoLogs, paymentLogs, allFunds, xdcPrice, promoCodes };
}

function round2(n) {
  return String(Math.round(parseFloat(n) * Math.pow(10, 2)) / Math.pow(10, 2));
}

function round6(n) {
  return String(Math.round(parseFloat(n) * Math.pow(10, 6)) / Math.pow(10, 6));
}

export default connect(mapsStateToProps, actions)(CoursePaymentMonitor);
