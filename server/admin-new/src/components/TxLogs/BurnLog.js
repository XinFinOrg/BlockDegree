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

// SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true
  },
  {
    dataField: "principal_userEmail",
    text: "Prin. Payee Email",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "principal_payment_id",
    text: "Payment Id",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "principal_txn_hash",
    text: "Prin. TX Hash",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "course",
    text: "Course",
    filter: textFilter(),
    sort: true,
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
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "principal_from",
    text: "Principal From",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "from",
    text: "From",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "to",
    text: "To",
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
  }
];

class BurnLogs extends Component {
  componentDidMount() {
    this.props.fetchAllBurnLog(); // load on table
  }

  filterLogsData() {
    console.log("called filter user data");
    const logs = this.props.burnLogs.logs;
    // SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
    let srNo = 1;
    const retData = [];

    // hash a certificate
    //  currCert
    logs.forEach(log => {
      retData.push({
        srNo: srNo++,
        principal_userEmail: log.principal_userEmail,
        principal_payment_id: log.principal_payment_id,
        principal_txn_hash: log.principal_txn_hash,
        course: log.course,
        tokenName: log.tokenName,
        tokenAmt: log.tokenAmt,
        principal_from: log.principal_from,
        from: log.from,
        to: log.to,
        creationDate: new Date(parseFloat(log.creationDate)).toString()
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
              <h4>Burn Logs Table</h4>
              <p>Table with all burn logs</p>
            </div>
            <div>
              {this.props.burnLogs ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterLogsData()}
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

function mapsStateToProps({ burnLogs }) {
  return { burnLogs };
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
    }
  }
}

export default connect(mapsStateToProps,actions)(BurnLogs);
