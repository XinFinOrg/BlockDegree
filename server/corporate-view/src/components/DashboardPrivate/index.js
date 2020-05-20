import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import BootstrapTable from "react-bootstrap-table-next";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import QRCode from "qrcode.react";
import xdc_favicon from "../../assets/img/xdcFavicons/favicon.ico";
import { AddNoti } from "../../helpers/Notification";

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

const selectedRows = [];
let allSelected = false;

function getCurrentSelectedArr() {
  let returnArray = [];
  for (let i = 0; i < selectedRows.length; i++) {
    if (selectedRows[i] === true) {
      returnArray.push(i);
    }
  }
  return returnArray;
}

const selectRow = {
  mode: "checkbox",
  clickToSelect: false,
  onSelect: (row, isSelect, rowIndex, e) => {
    selectedRows[rowIndex + ""] = isSelect;
    console.log("selectedRows: ", selectedRows);
  },
  onSelectAll: (isSelect, rows, e) => {
    allSelected = isSelect;
    console.log("allSelected: ", allSelected);
  },
  selected: getCurrentSelectedArr(),
};

const initialState = {
  tableData: null,
  showDescModal: false,
  descData: null,
};

class DasboardPrivate extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.renderData = this.renderData.bind(this);
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

  componentWillMount() {
    this.props.fetchAllFunds();
  }

  render() {
    return (
      <div>
        <div className="table-one">
          {this.props.allFunds ? (
            <BootstrapTable
              keyField="id"
              data={this.renderData(this.props.allFunds.data)}
              columns={columns}
              selectRow={selectRow}
            />
          ) : (
            <BootstrapTable
              keyField="id"
              data={prepopulatedData}
              columns={columns}
              selectRow={selectRow}
            />
          )}
        </div>
        <div className="u-right u-pad-right-1 ">
          <Button
            onClick={() => {
              this.setState({ showPayXdcModal: true });
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
              payXdcAddr: null,
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
            <div class="qr-modal__body--pretext">
              Send Amount&nbsp;
              <strong>
                <span>12312.123123</span>&nbsp;XDC coin
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
                <QRCode value="xdc687B8b567D12d2564141cbe5d44a5f04DFd9Ba5a" />
              </div>
              <div className="address">
                xdc687B8b567D12d2564141cbe5d44a5f04DFd9Ba5a
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "xdc687B8b567D12d2564141cbe5d44a5f04DFd9Ba5a"
                  );
                  AddNoti("Copied", "XDC Address Copied", "info", 1000);
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
      </div>
    );
  }
}

function mapStateToProps({ allFunds }) {
  return { allFunds };
}

export default connect(mapStateToProps, actions)(DasboardPrivate);
