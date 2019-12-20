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
  selectFilter
} from "react-bootstrap-table2-filter";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

function createdPostFilter(filterVal, data) {
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter(row => {
      if (!isNaN(Date.parse(row.timestamp)) && Date.parse(row.timestamp) > 0) {
        return evaluateDateExpression(
          row.timestamp,
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

// SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true
  },
  {
    dataField: "email",
    text: "User Email",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "course_id",
    text: "Course Id",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "payment_id",
    text: "Payment ID",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "payment_status",
    text: "Payment Status",
    formatter: cell => boolOptionStatus[cell],
    filter: selectFilter({
      options: boolOptionStatus
    }),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "timestamp",
    text: "Timestamp",
    filter: dateFilter({
      onFilter: createdPostFilter
    }),
    headerFormatter: defHeadFormatter
  }
];

class PaymentLog extends Component {

  componentDidMount(){
    this.props.fetchAllPaymentLog(); // load on table
  }

  filterPaymentLogsData() {
    console.log("called filter payment logs");
    console.log(this.props.paymentLogs)
    const logs = this.props.paymentLogs.logs;
    // SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
    let srNo = 1;
    const retData = [];
    logs.forEach(log => {
      retData.push({
        srNo: srNo++,
        email: log.email,
        course_id: log.course_id, 
        payment_id: log.payment_id,
        payment_status: log.payment_status,
        timestamp: new Date(log.timestamp).toString()
      });
    });
    return retData;
  }

  render() {
    return (
      <div className="table-container">
        <div className="row">
          <div className="col-md-12">
            <div className="header">
              <h4>Payment Logs</h4>
              <p>Table with all payment logs</p>
            </div>
            <div>
              {this.props.paymentLogs ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterPaymentLogsData()}
                    columns={columns}
                    filter={filterFactory()}
                    pagination={paginationFactory({
                      hideSizePerPage: true
                    })}
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

function mapsStateToProps({ paymentLogs }) {
  return { paymentLogs };
}

function evaluateDateExpression(a, b, comparator) {
  const a_date = new Date(a);
  const b_date = new Date(b);
  b_date.setHours(0,0,0,0);
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

export default connect(mapsStateToProps,actions)(PaymentLog);
