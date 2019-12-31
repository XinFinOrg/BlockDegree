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
      console.log("inside post filter ", !isNaN(Date.parse(row.created)));
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

const boolOptionStatus = {
  true: "true",
  false: "false"
};

const boolOptionRestricted = {
  true: "true",
  false: "false"
};

// srNo, codeName, discAmt, purpose, status, restricted, usedCount ( count ), userCount ( users.length ) , created, lastUsed
const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true
  },
  {
    dataField: "codeName",
    text: "Promocode",
    sort: true,
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "discAmt",
    text: "Disc. Amount ($)",
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
    text: "Status",
    formatter: cell => boolOptionStatus[cell],
    filter: selectFilter({
      options: boolOptionStatus
    }),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "restricted",
    text: "Restricted",
    formatter: cell => boolOptionRestricted[cell],
    filter: selectFilter({
      options: boolOptionRestricted
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

class PromoCodes extends Component {
  componentDidMount() {
    setTimeout(this.props.fetchAllPromoCodes(), 1000); // load on table
  }

  handleDataChange = data => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };

  paginationOption = () => {
    return {
      custom: true,
      totalSize: this.props.promoCodes.codes.length
    };
  };

  filterPromoCodeData() {
    console.log("called promocode data");
    console.log(this.props.promoCodes);
    const promoCodes = this.props.promoCodes.codes;
    console.log(promoCodes);
    // SR. no, CodeName, discAmnt ,purpose, status, restricted, count, created, last active
    let srNo = 1;
    const retData = [];
    promoCodes.forEach(code => {
      retData.push({
        srNo: srNo++,
        codeName: code.codeName,
        restricted: code.restricted.toString(),
        purpose: code.purpose,
        status: code.status.toString(),
        userCount: code.users.length,
        usedCount: code.count,
        discAmt: code.discAmt,
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
                  <h4>Promocode Tables</h4>
                  <p>Table with all Promocodes</p>
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
              {this.props.promoCodes ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterPromoCodeData()}
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

function mapsStateToProps({ promoCodes }) {
  return { promoCodes };
}

export default connect(mapsStateToProps, actions)(PromoCodes);
