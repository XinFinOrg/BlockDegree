import React, { Component } from "react";
import { connect } from "react-redux";
// import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";

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
      if (!isNaN(Date.parse(row.issueDate)) && Date.parse(row.issueDate) > 0) {
        return evaluateDateExpression(
          row.issueDate,
          filterVal.date,
          filterVal.comparator
        );
      }
      return false;
    });
  }
  return data;
}

function expiryDatePostFilter(filterVal, data) {
  if (filterVal.date != null && filterVal.comparator !== "") {
    return data.filter(row => {
      if (
        !isNaN(Date.parse(row.expiryDate)) &&
        Date.parse(row.expiryDate) > 0
      ) {
        return evaluateDateExpression(
          row.expiryDate,
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
    dataField: "email",
    text: "User Eamil",
    filter: textFilter(),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "examName",
    text: "Exam Name",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "marks",
    text: "Marks Obtained",
    filter: numberFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "total",
    text: "Total Marks",
    filter: numberFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "docHash",
    text: "Headless Hash",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "certHash",
    text: "Certificate Hash",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "paymentMode",
    text: "Payment Mode",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "expiryDate",
    text: "Expiry Date",
    filter: dateFilter({
      onFilter: expiryDatePostFilter
    }),
    headerFormatter: defHeadFormatter
  },
  {
    dataField: "issueDate",
    text: "Issued Date",
    filter: dateFilter({
      onFilter: createdPostFilter
    }),
    headerFormatter: defHeadFormatter
  }
];

class Certificates extends Component {
  // to load the current count
  componentDidMount() {
    if (this.props.allUsers) this.filterCertificateData();
  }

  filterCertificateData() {
    console.log("called filter user data");
    const userData = this.props.allUsers.users;
    // SR NO, EmailID, E.TYPE, Marks, T. Marks, Headless Hash, Certificate Hash, Issue Date, Payment Mode, Expiry
    let srNo = 1;
    const retData = [];
    userData.forEach(user => {
      if (user.examData.certificateHash.length > 1) {
        // hash a certificate
        for (let i = 1; i < user.examData.certificateHash.length; i++) {
          //  currCert
          let currCert = user.examData.certificateHash[i];
          retData.push({
            srNo: srNo++,
            email: user.email,
            examName: currCert.examType,
            marks: currCert.marks,
            total: currCert.total,
            docHash: currCert.headlessHash,
            certHash: currCert.clientHash,
            paymentMode: Object.keys(currCert).includes("paymentMode")
              ? currCert.paymentMode
              : "No Data",
            issueDate: new Date(parseFloat(currCert.timestamp)).toString(),
            expiryDate: Object.keys(currCert).includes("expiryDate")
              ? new Date(parseFloat(currCert.expiryDate)).toString()
              : "No Expiry"
          });
        }
      }
    });
    if (document.getElementById("currDataCount"))
      document.getElementById("currDataCount").innerHTML = retData.length;
    return retData;
  }

  handleDataChange = data => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };

  render() {
    return (
      <div className="table-container">
        <div className="row">
          <div className="col-md-12">
            <div className="header">
              <div className="row">
                <div className="col-md-6">
                  <h4>Certificates Table</h4>
                  <p>Table with all Users Users</p>
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
              {this.props.allUsers ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterCertificateData()}
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

function mapsStateToProps({ allUsers }) {
  return { allUsers };
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

export default connect(mapsStateToProps)(Certificates);
