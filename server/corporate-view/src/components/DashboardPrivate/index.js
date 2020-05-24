import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import QRCode from "qrcode.react";
import { Redirect } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";

import BootstrapTable from "react-bootstrap-table-next"; // React Bootstrap Table Next
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";

import * as actions from "../../actions/index";
import xdc_favicon from "../../assets/img/xdcFavicons/favicon.ico";
import { AddNoti, RemoveNoti } from "../../helpers/Notification";
import RouteButton from "../../hooks/RouteButton";
import PaymentModal from "../../helpers/PaymentModal";

const { SearchBar } = Search;

const columns = [
  {
    dataField: "requestDate",
    text: "Request Date",
  },
  {
    dataField: "studentName",
    text: "Student Name",
  },
  {
    dataField: "desc",
    text: "View Details",
  },
  {
    dataField: "courses",
    text: "Courses",
  },
  {
    dataField: "amount",
    text: "Amount",
  },
];

const prepopulatedData = [
  {
    id: 1,
    desc: (
      <div className="table-one__loader">
        <FontAwesomeIcon icon={faCogs} size="5x" />
        <div>LOADING</div>
      </div>
    ),
  },
];

const initialState = {
  tableData: null,
  showDescModal: false,
  showPayXdcModal: false,
  payXdcAddr: "",
  payXdcAmt: null,
  descData: null,
  processingXdc: false,
  selectedRows: [],
  allSelected: false,
};

class DasboardPrivate extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.renderData = this.renderData.bind(this);
    this.handlePaymentXdcClick = this.handlePaymentXdcClick.bind(this);
  }

  componentWillMount() {
    this.props.fetchAllFunds();
  }

  renderData(allData) {
    let returnData = [];
    for (let i = 0; i < allData.length; i++) {
      let data = allData[i];
      let obj = {
        id: i + "",
        requestDate: new Date(parseFloat(data.createdAt)).toDateString(),
        studentName: data.userName,
        desc: (
          <Button
            onClick={() => {
              this.setState({
                showDescModal: true,
                descData: data.description,
              });
            }}
            type="button"
          >
            View Details
          </Button>
        ),
        courses: data.courseId,
        amount: data.amountGoal,
      };
      returnData.push(obj);
    }
    return returnData;
  }

  handlePaymentPaypal = (allData) => {
    let selectedRows = this.state.selectedRows;
    let allSelected = this.state.allSelected;

    let selectedFundIds = [];
    if (allSelected === true) {
      for (let i = 0; i < allData.length; i++) {
        selectedFundIds.push(allData[i].fundId);
      }
    } else {
      for (let i = 0; i < selectedRows.length; i++) {
        if (selectedRows[i] !== undefined)
          selectedFundIds.push(allData[i].fundId);
      }
    }
    console.log("select id: ", selectedFundIds);
    if (selectedRows.length === 0) {
      AddNoti("Error", "No Fund Selected", { type: "warning" });
      return;
    }
    axios
      .post("/api/corp-pay-paypal", {
        fundIds: selectedFundIds,
      })
      .then((resp) => {
        resp = resp.data;
        if (resp.status === true) {
          console.log("Response: ", resp);
          document.location.replace(resp.link); 
        } else {
          AddNoti("Error", resp.error, { type: "error" });
        }
      });
  };

  handlePaymentXdcClick(allData) {
    let selectedRows = this.state.selectedRows;
    let allSelected = this.state.allSelected;
    let selectedFundIds = [];
    if (allSelected === true) {
      for (let i = 0; i < allData.length; i++) {
        selectedFundIds.push(allData[i].fundId);
      }
    } else {
      for (let i = 0; i < selectedRows.length; i++) {
        if (selectedRows[i] !== undefined)
          selectedFundIds.push(allData[i].fundId);
      }
    }
    console.log("select id: ", selectedFundIds);
    if (selectedRows.length === 0) {
      AddNoti("Error", "No Fund Selected", { type: "warn" });
      return;
    }
    axios
      .post("/api/getBulkAddress", {
        fundIds: selectedFundIds,
        type: "corporate",
      })
      .then((resp) => {
        resp = resp.data;
        if (resp.status === true) {
          this.setState({
            showPayXdcModal: true,
            payXdcAddr: resp.data.address,
            payXdcAmt: resp.data.xdc,
          });
        } else {
          AddNoti("Error", resp.error, { type: "error" });
        }
      });
  }

  render() {
    let tableData = prepopulatedData;

    let returnArray = [];
    let selectedRows = this.state.selectedRows;
    for (let i = 0; i < selectedRows.length; i++) {
      if (selectedRows[i] === true) {
        returnArray.push(i + "");
      }
    }

    let selectRow = {
      mode: "checkbox",
      clickToSelect: false,
      onSelect: (row, isSelect, rowIndex, e) => {
        let selectedRows = this.state.selectedRows;
        selectedRows[rowIndex + ""] = isSelect;
        this.setState({ selectedRows });
        console.log("selectedRows: ", selectedRows);
      },
      onSelectAll: (isSelect, rows, e) => {
        let selectedRows = this.state.selectedRows;
        let allSelected = this.state.allSelected;

        allSelected = isSelect;
        for (let i = 0; i < selectedRows.length; i++) {
          selectedRows[i] = isSelect;
        }
        this.setState({ selectedRows, allSelected });
      },
      selected: returnArray,
    };

    if (this.props.allFunds) {
      tableData = this.renderData(this.props.allFunds.data);
    }

    return (
      <div>
        <div className="dashboard">
          <div className="note-text">
            <b>Note :</b>
            <ul>
              <li>You can select one or more fund requests to fund.</li>
              <li>
                All the fund request's certificates will have your logo in it,
                check{" "}
                <b className="note-text__link">
                  <RouteButton to="/profile" value={"Profile"} />
                </b>{" "}
                for more details.
              </li>
              <li>
                For queires{" "}
                <a target="_blank" href="https://www.blockdegree.org/contact">
                  contact here
                </a>{" "}
                or mail at <b>info@blockdegree.org</b>
              </li>
            </ul>
          </div>
          <PaginationProvider
            pagination={paginationFactory({
              custom: true,
              totalSize: tableData.length,
            })}
          >
            {({ paginationProps, paginationTableProps }) => (
              <div className="table-one">
                <div>
                  <PaginationListStandalone {...paginationProps} />
                  <ToolkitProvider
                    keyField="id"
                    columns={columns}
                    data={tableData}
                    search
                  >
                    {(toolkitprops) => (
                      <>
                        <SearchBar {...toolkitprops.searchProps} />
                        <BootstrapTable
                          keyField="id"
                          data={tableData}
                          columns={columns}
                          selectRow={selectRow}
                          {...toolkitprops.baseProps}
                          {...paginationTableProps}
                        />
                      </>
                    )}
                  </ToolkitProvider>
                </div>
              </div>
            )}
          </PaginationProvider>
          <div className="u-right u-pad-right-1 ">
            <Button
              onClick={(e) => {
                this.setState({ showPaymentModal: true });
              }}
              className="std-btn"
            >
              FUND NOW
            </Button>
          </div>
          <Modal
            onHide={() => {
              this.setState({ descData: null, showDescModal: false });
            }}
            show={this.state.showDescModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            dialogClassName="description-modal blockdegree-modal"
          >
            <Modal.Header className="description-modal__header" closeButton>
              <Modal.Title className="description-modal__header--title">
                Request by Rudresh Solanki
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="description-modal__body">
              <div>{this.state.descData}</div>
            </Modal.Body>
          </Modal>

          <Modal
            onHide={() => {
              this.setState({
                payXdcAddr: "",
                amountUsd: null,
                amountXdc: null,
                showPayXdcModal: false,
              });
            }}
            show={this.state.showPayXdcModal}
            size="lg"
            dialogClassName="qr-modal blockdegree-modal"
          >
            <Modal.Header className="qr-modal__header" closeButton>
              <Modal.Title className="qr-modal__header--title">
                Pay By XDC
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="qr-modal__body">
              <div className="qr-modal__body--pretext">
                Send Amount&nbsp;
                <strong>
                  <span>{this.state.payXdcAmt}</span>&nbsp;XDC coin
                </strong>
                &nbsp; to the address below using your&nbsp;
                <strong>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.xdcwallet&hl=en_IN"
                    target="_blank"
                  >
                    XDC Wallet
                  </a>
                </strong>
              </div>
              <div className="qr-modal__body--wrap">
                <div className="qr-modal__body--img">
                  <QRCode value={this.state.payXdcAddr} />
                </div>
                <div className="address">{this.state.payXdcAddr}</div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "xdc687B8b567D12d2564141cbe5d44a5f04DFd9Ba5a"
                    );
                    AddNoti("Copied", "XDC Address Copied", {
                      type: "info",
                      duration: 1000,
                    });
                  }}
                  className="copy-btn"
                >
                  Copy
                </Button>
              </div>
              <hr />
              <div>
                <div>
                  Don't have&nbsp;
                  <strong>
                    XDC&nbsp;
                    <img src={xdc_favicon}></img>
                    &nbsp;
                  </strong>
                  ?&nbsp;Buy from{" "}
                  <a href="https://alphaex.net" target="_blank">
                    AlphaEx
                  </a>{" "}
                  or{" "}
                  <a href="https://stex.com" target="_blank">
                    Stex
                  </a>
                </div>
              </div>
              <div>
                Download XDC Wallet&nbsp;
                <a
                  href="https://play.google.com/store/apps/details?id=com.xdcwallet&hl=en_IN"
                  target="_blank"
                >
                  Android
                </a>
              </div>
            </Modal.Body>
          </Modal>
          <PaymentModal
            paypalOnClick={() => {
              this.setState({ showPaymentModal: false });
              this.handlePaymentPaypal(this.props.allFunds.data);
            }}
            xdcWalletOnClick={() => {
              this.handlePaymentXdcClick(this.props.allFunds.data);
            }}
            show={this.state.showPaymentModal}
            onHide={() => {
              this.setState({ showPaymentModal: false });
            }}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps({ allFunds }) {
  return { allFunds };
}

export default connect(mapStateToProps, actions)(DasboardPrivate);
