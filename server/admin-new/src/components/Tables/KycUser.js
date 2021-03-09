
import React, { Component } from "react";
import { connect } from "react-redux";
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
import { Button, Modal } from "react-bootstrap";
import Axios from "axios";

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

const kycColumns = [
  {
    dataField: "srNo",
    text: "Sr.No",
    sort: true,
  },
  {
    dataField: "email",
    text: "User Email",
    sort: true,
    filter: textFilter(),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "name",
    text: "name",
    filter: textFilter(),
    sort: true,
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "dob",
    text: "D.O.B",
    filter: dateFilter(),
    sort: true,
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "address",
    text: "Address",
    filter: textFilter(),
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "selfie",
    text: "Selfie Images",
    sort: true,
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "kycFrontImg",
    text: "KYC Front Images",
    sort: true,
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "kycBackImg",
    text: "KYC Back Images",
    sort: true,
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "approve",
    text: "Approve KYC",
    sort: true,
    headerFormatter: defHeadFormatter,
  },
  {
    dataField: "reject",
    text: "Reject KYC",
    sort: true,
    headerFormatter: defHeadFormatter,
  },
];

export class KycUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }
  componentDidMount() {
    this.props.fetchAllKycUser();
    if (this.props.kycuser) this.filterKycUser();
  }

  showImg() {
    this.setState({ showModal: !this.state.showModal });
  }

  filterKycUser() {
    let srNo = 1;
    let returnData = [];
    this.props.kycuser.data.map(user => {
      if (user.length < 0) {
        return <span>No data Available</span>;
      } else {
        returnData.push({
          srNo: srNo++,
          email: user.email,
          name: user.name,
          dob: user.dob,
          address: user.address,
          selfie: <Button onClick={() => {
            this.props.fetchKycUserPic(user.img.selfie);
            this.showImg();
          }}>Show Image</Button>,
          kycFrontImg: <Button onClick={() => {
            this.props.fetchKycUserPic(user.img.kycFrontImg);
            this.showImg();
          }}>Show Image</Button>,
          kycBackImg: <Button onClick={() => {
            this.props.fetchKycUserPic(user.img.kycBackImg);
            this.showImg();
          }}>Show Image</Button>,
          approve: <Button onClick={() => {
            this.props.approveKycUser(user.email);
          }}>Approve</Button>,
          reject: <Button onClick={() => {
            this.props.rejectKycUser(user.email);
          }}>Reject</Button>
        });
      }
    });
    if (document.getElementById("currDataCount"))
      document.getElementById("currDataCount").innerHTML = returnData.length;
    return returnData;
  }

  handleDataChange = data => {
    document.getElementById("currDataCount").innerHTML = data.dataSize;
  };
  
  render() {
    let showModalWithImg = (
      <Modal show={this.state.showModal} keyboard={true} centered animation={true} onHide={() => { this.setState({ showModal: !this.state.showModal }); }} size="lg" aria-labelledby="contained-modal-title-vcenter"
        dialogClassName="description-modal blockdegree-modal">
        <Modal.Header closeButton>
          <Modal.Title>{}</Modal.Title>
          <Modal.Body>
            {/* <img src={} /> */}
            Hello
          </Modal.Body>
        </Modal.Header>
      </Modal>
    );
    return (
      <div className="table-container">
        {showModalWithImg}
        <div className="row">
          <div className="col-md-12">
            <div className="header">
              <div className="row">
                <div className="col-md-6">
                  <h4>
                    KYC Table{" "}
                    <span
                      onClick={() => {
                        this.props.fetchAllKycUser();
                      }}
                      className="table-refresh-btn"
                    >
                      <i class="fa fa-refresh" aria-hidden="true"></i>
                    </span>
                  </h4>
                  <p>Table with all KYC Users</p>
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
                    {this.props.kycuser ? (
                      <div className="table-updated right">
                        <i className="fa fa-history"></i> Updated at{" "}
                        <strong>
                          {new Date(this.props.kycuser.fetchedTS).getHours() +
                            ":" +
                            new Date(
                              this.props.kycuser.fetchedTS
                            ).getMinutes()}
                        </strong>{" "}
                        Hours
                      </div>
                    ) : (
                        ""
                      )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              {this.props.kycuser ? (
                <div>
                  <BootstrapTable
                    keyField="srNo"
                    data={this.filterKycUser()}
                    columns={kycColumns}
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

function mapsStateToProps({ kycuser, rejectkycuser, approvekycuser, }) {
  return { kycuser, rejectkycuser, approvekycuser, };
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

export default connect(mapsStateToProps, actions)(KycUser);