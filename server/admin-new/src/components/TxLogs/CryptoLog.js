import React, { Component } from "react";
import { connect } from "react-redux";
// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import * as actions from "../../actions";
import paginationFactory from "react-bootstrap-table2-paginator";

import filterFactory, {
  textFilter,
  dateFilter,
  selectFilter,
  numberFilter
} from "react-bootstrap-table2-filter";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

function createdPostFilter(filterVal, data) {
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter(row => {
      if (
        !isNaN(Date.parse(row.creationDate)) &&
        Date.parse(row.creationDate) > 0
      ) {
        return evaluateDateExpression(
          row.creationDate,
          filterVal.date,
          filterVal.comparator
        );
      }
      return false;
    });
  }
  return data;
}

function defHeadFormatter(column, colIndex, { sortElement, filterElement }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>{filterElement}</div>
      <div>
        {column.text}
        {sortElement}
      </div>
    </div>
  );
}

const boolOptionStatus = {
  true: "true",
  false: "false"
};

const statusSelect = {
  notYetMined: "not yet mined",
  pending: "pending",
  completed: "completed"
};

// SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true
  },
  {
    dataField: "payment_id",
    text: "Payment ID",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "email",
    text: "User Email",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "creationDate",
    text: "Creation Date",
    filter: dateFilter({
      onFilter: createdPostFilter
    }),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "txn_hash",
    text: "TX Hash",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "course",
    text: "Course ID",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "tokenName",
    text: "Token Name",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "tokenAmt",
    text: "Token Amount",
    filter: numberFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "price",
    text: "Price",
    filter: numberFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "status",
    text: "Status",
    formatter: cell => statusSelect[cell],
    filter: selectFilter({
      options: statusSelect
    }),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "confirmations",
    text: "Confirmations",
    filter: numberFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "autoBurn",
    text: "Autoburn",
    formatter: cell => boolOptionStatus[cell],
    filter: selectFilter({
      options: boolOptionStatus
    }),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "burn_txn_hash",
    text: "Burn TX Hash",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "burn_token_amnt",
    text: "Burn Token Amount",
    filter: numberFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "payment_network",
    text: "Payment Chain ID",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "promoCode",
    text: "Promocode",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "referralCode",
    text: "Referral Code",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  }
];

class PaymentLog extends Component {
  componentDidMount() {
    this.props.fetchAllCryptoLog(); // load on table
  }

  handleDataChange = data => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };

  filterPaymentLogsData() {
    console.log("called filter payment logs");
    console.log(this.props.cryptoLogs);
    const logs = this.props.cryptoLogs.logs;
    // SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
    let srNo = 1;
    const retData = [];
    logs.forEach(log => {
      retData.push({
        srNo: srNo++,
        email: log.email,
        course: log.course,
        payment_id: log.payment_id,
        status: log.status,
        creationDate: new Date(parseFloat(log.creationDate)).toString(),
        txn_hash: log.txn_hash,
        tokenName: log.tokenName,
        tokenAmt: log.tokenAmt,
        price: log.price,
        confirmations: log.confirmations,
        autoBurn: log.autoBurn,
        burn_txn_hash: log.burn_txn_hash,
        burn_token_amnt: log.burn_token_amnt,
        payment_network: log.payment_network,
        promoCode: log.promoCode,
        referralCode: log.referralCode
      });
    });
    if (document.getElementById("currDataCount"))
      document.getElementById("currDataCount").innerHTML = retData.length;
    return retData;
  }

  render() {
    return (
      <div className="table-container">
        <div className="row">
          <div className="col-md-12">
            <div className="header">
              <div className="row">
                <div className="col-md-6">
                  <h4>Payment Logs</h4>
                  <p>Table with all payment logs</p>
                </div>
                <div className="col-md-6">
                  <div
                    id="currRowCount"
                    className="right table-row-count-wrapper"
                  >
                    <span>
                      <span className="table-row-count-label">
                        Current Row Count&nbsp;
                        <i class="fa fa-arrow-right"></i>
                        &nbsp;
                      </span>
                      <span id="currDataCount" className="table-row-count">
                        {" "}
                        <i
                          className="fa fa-cogs"
                          style={{ color: "black" }}
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {this.props.cryptoLogs ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterPaymentLogsData()}
                    columns={columns}
                    filter={filterFactory()}
                    pagination={paginationFactory({
                      hideSizePerPage: true
                    })}
                    onDataSizeChange={this.handleDataChange}
                  />
                </div>
              ) : (
                <div className="chart-preload">
                  <div>
                    <i className="fa fa-cogs fa-5x" aria-hidden="true" />
                  </div>
                  Loading
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapsStateToProps({ cryptoLogs }) {
  return { cryptoLogs };
}

function evaluateDateExpression(a, b, comparator) {
  const a_date = new Date(a);
  const b_date = new Date(b);
  b_date.setHours(0, 0, 0, 0);
  switch (comparator) {
    case "=": {
      if (
        a_date.getDate() === b_date.getDate() &&
        a_date.getMonth() === b_date.getMonth() &&
        a_date.getFullYear() === b_date.getFullYear()
      ) {
        return true;
      }
      return false;
    }
    case ">=": {
      if (a_date.getTime() >= b_date.getTime()) {
        return true;
      }
      return false;
    }
    case "<=": {
      if (a_date.getTime() <= b_date.getTime()) {
        return true;
      }
      return false;
    }
    case ">": {
      if (a_date.getTime() > b_date.getTime()) {
        return true;
      }
      return false;
    }
    case "<": {
      if (a_date.getTime() < b_date.getTime()) {
        return true;
      }
      return false;
    }
    default: {
      break;
    }
  }
}

export default connect(mapsStateToProps, actions)(PaymentLog);
