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
  numberFilter,
  selectFilter
} from "react-bootstrap-table2-filter";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

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

function createdPostFilter(filterVal, data) {
  console.log(filterVal, data);
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter(row => {
      console.log(
        "inside post filter ",
        row.created,
        !isNaN(Date.parse(row.created))
      );
      if (!isNaN(Date.parse(row.created)) && Date.parse(row.created) > 0) {
        return evaluateDateExpression(
          row.created,
          filterVal.date,
          filterVal.comparator
        );
      }
      return false;
    });
  }
  return data;
}

function lastUsedPostFilter(filterVal, data) {
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter(row => {
      console.log("inside post filter ", !isNaN(Date.parse(row.lastUsed)));
      if (!isNaN(Date.parse(row.lastUsed)) && Date.parse(row.lastUsed) > 0) {
        return evaluateDateExpression(
          row.lastUsed,
          filterVal.date,
          filterVal.comparator
        );
      }
      return false;
    });
  }
  return data;
}

const boolOption = {
  true: "true",
  false: "false"
};

// srNo, referralCode, refererEmail, purpose, status, usedCount, userCount, created, lastUsed
const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true
  },
  {
    dataField: "referralCode",
    text: "Referrer Code",
    sort: true,
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "referrerEmail",
    text: "Referrer Email",
    sort: true,
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "purpose",
    text: "Purpose",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "status",
    text: "status",
    formatter: cell => boolOption[cell],
    filter: selectFilter({
      options: boolOption
    }),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "usedCount",
    text: "Used Count",
    filter: numberFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "userCount",
    text: "User Count",
    filter: numberFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "created",
    text: "Created",
    filter: dateFilter({
      onFilter: createdPostFilter
    }),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "lastUsed",
    text: "Lact Used",
    filter: dateFilter({
      onFilter: lastUsedPostFilter
    }),
    headerFormatter: defHeadFormatter
  }
];

class ReferralCodes extends Component {
  componentDidMount() {
    this.props.fetchAllReferralCodes(); // load on table
  }

  paginationOption = () => {
    return {
      custom: true,
      totalSize: this.props.referralCodes.codes.length
    };
  };

  handleDataChange = data => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };

  filterReferralCodesData() {
    console.log("called referral code data");
    console.log(this.props.referralCodes);
    const referralCodes = this.props.referralCodes.codes;
    console.log(referralCodes);
    // SR. no, CodeName, discAmnt ,purpose, status, restricted, count, created, last active
    let srNo = 1;
    const retData = [];
    referralCodes.forEach(code => {
      retData.push({
        srNo: srNo++,
        referralCode: code.referralCode,
        referrerEmail: code.referrerEmail,
        purpose: code.purpose,
        status: code.status.toString(),
        userCount: code.users.length,
        usedCount: code.count,
        created:
          code.created !== ""
            ? new Date(parseFloat(code.created)).toString()
            : "No data",
        lastUsed:
          code.lastUsed !== ""
            ? new Date(parseFloat(code.lastUsed)).toString()
            : "No data"
      });
    });
    console.log("FILTERED DATA::");
    console.log(retData);
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
                  <h4>Referral Code Tables</h4>
                  <p>Table with all Referral Code</p>
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
              {this.props.referralCodes ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterReferralCodesData()}
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
function mapsStateToProps({ referralCodes }) {
  return { referralCodes };
}

export default connect(mapsStateToProps, actions)(ReferralCodes);
