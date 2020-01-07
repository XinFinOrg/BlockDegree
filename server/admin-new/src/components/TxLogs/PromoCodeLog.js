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
      if (!isNaN(Date.parse(row.usedDate)) && Date.parse(row.usedDate) > 0) {
        return evaluateDateExpression(
          row.usedDate,
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
      {console.log(filterElement)}
      <div>{filterElement}</div>
      <div>
        {column.text}
        {sortElement}
      </div>
    </div>
  );
}

// codeName, discAmt, user_email, course_id, course_price, used_date
const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true
  },
  {
    dataField: "email",
    text: "User Eamil",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "discAmt",
    text: "Discount Amount",
    filter: numberFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "codeName",
    text: "Promocode Name",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "courseId",
    text: "Course Id",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "coursePrice",
    text: "Course Price",
    filter: numberFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "usedDate",
    text: "Used Date",
    filter: dateFilter({
      onFilter: createdPostFilter
    }),
    headerFormatter: defHeadFormatter
  }
];

class PromoCodeLogs extends Component {
  // to load the current count
  componentDidMount() {
    if (this.props.promoCodeLogs) this.filterLogData();
  }

  handleDataChange = data => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };

  filterLogData() {
    console.log("called filter user data");
    const logs = this.props.promoCodeLogs.logs;
    console.log(this.props.promoCodeLogs);
    console.log(logs);
    // SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
    let srNo = 1;
    const retData = [];
    logs.forEach(log => {
      retData.push({
        srNo: srNo++,
        email: log.user_email,
        codeName: log.codeName,
        courseId: log.course_id,
        coursePrice: log.course_price,
        usedDate: new Date(parseFloat(log.used_date)).toString(),
        discAmt: log.discAmt
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
                  <h4>
                    PromoCode Logs
                    <span
                      onClick={() => {
                        this.props.fetchAllPromoCodeLog();
                      }}
                      className="table-refresh-btn"
                    >
                      <i class="fa fa-refresh" aria-hidden="true"></i>
                    </span>
                  </h4>
                  <p>Table with all promocode logs</p>
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
                    <br />
                    <div className="table-updated right">
                      <i className="fa fa-history"></i> Updated at{" "}
                      <strong>
                        {new Date().getHours() + ":" + new Date().getMinutes()}
                      </strong>{" "}
                      Hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {this.props.promoCodeLogs ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterLogData()}
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

function mapsStateToProps({ promoCodeLogs }) {
  return { promoCodeLogs };
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

export default connect(mapsStateToProps, actions)(PromoCodeLogs);
