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
} from "react-bootstrap-table2-filter";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

function createdPostFilter(filterVal, data) {
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter((row) => {
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

function lastActivePostFilter(filterVal, data) {
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter((row) => {
      if (
        !isNaN(Date.parse(row.lastActive)) &&
        Date.parse(row.lastActive) > 0
      ) {
        return evaluateDateExpression(
          row.lastActive,
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

const columns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true,
  },
  {
    dataField: "email",
    text: "User Eamil",
    filter: textFilter(),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "sessionID",
    text: "Session ID",
    filter: textFilter(),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "ip",
    text: "IP Address",
    filter: textFilter(),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "platform",
    text: "Platform",
    filter: textFilter(),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "startTime",
    text: "Session Start",
    filter: dateFilter({
      onFilter: createdPostFilter,
    }),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "endTime",
    text: "Session End",
    filter: dateFilter({
      onFilter: lastActivePostFilter,
    }),
    headerFormatter: defHeadFormatter,
  },
];

class UsersSessions extends Component {
  // to load the current count
  componentDidMount() {
    this.props.fetchAllUserSessions();
    // this.filterUserData();
  }

  paginationOption = () => {
    return {
      custom: true,
      totalSize: this.props.userSessions.length,
    };
  };

  handleDataChange = (data) => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };

  filterUserData() {
    const userData = this.props.userSessions;
    console.log("userData::::", userData);
    // SR. no, Name, Email ID, Certificate Count, Created, Last Used
    let srNo = 1;
    const retData = [];
    userData.forEach((user) => {
      retData.push({
        srNo: srNo++,
        email: user.email,
        ip:user.ip,
        platform: user.platform,
        startTime: new Date(parseFloat(user.startTime)).toString(),
        endTime: user.endTime!=="" ? new Date(parseFloat(user.endTime)).toString():"Not Terminated",
        sessionID: user.sessionId,
      });
    });
    console.log("FILTERED DATA::");
    console.log(retData);
    if (document.getElementById("currDataCount"))
      document.getElementById("currDataCount").innerHTML = retData.length;
    return retData;
  }

  render() {
    console.log("userData", this.props.userSessions);
    return (
      <div className="table-container">
        <div className="row">
          <div className="col-md-12">
            <div className="header">
              <div className="row">
                <div className="col-md-6">
                  <h4>
                    UsersSessions Table{" "}
                    <span
                      onClick={() => {
                        this.props.fetchAllUserSessions();
                      }}
                      className="table-refresh-btn"
                    >
                      <i class="fa fa-refresh" aria-hidden="true"></i>
                    </span>
                  </h4>
                  <p>Table with all UsersSessions</p>
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
                    {/* {this.props.userSessions ? (
                      <div className="table-updated right">
                        <i className="fa fa-history"></i> Updated at{" "}
                        <strong>
                          {new Date(
                            this.props.userSessions.fetchedTS
                          ).getHours() +
                            ":" +
                            new Date(
                              this.props.userSessions.fetchedTS
                            ).getMinutes()}
                        </strong>{" "}
                        Hours
                      </div>
                    ) : (
                      ""
                    )} */}
                  </div>
                </div>
              </div>
            </div>
            <div>
              {this.props.userSessions ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterUserData()}
                    columns={columns}
                    filter={filterFactory()}
                    pagination={paginationFactory({
                      hideSizePerPage: true,
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

function mapsStateToProps({ userSessions }) {
  return { userSessions };
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

export default connect(mapsStateToProps, actions)(UsersSessions);
