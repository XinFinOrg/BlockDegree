import React, { Component } from "react";
import { connect } from "react-redux";
import FormData from "form-data";
import axios from "axios";
import _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";

import { Row, Col, Container, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";
import RequireLogin from "../middleware/RequireLogin";
import RouteButton from "../hooks/RouteButton";

import * as actions from "../actions/index";
import { AddNoti } from "../helpers/Notification";
import { GetDateLocalFormat, GetTxLink } from "../helpers/constant";

const columns = [
  {
    dataField: "requestDate",
    text: "Request Date",
  },
  {
    dataField: "acceptDate",
    text: "Accept Date",
  },
  {
    dataField: "fundCount",
    text: "Fund Count",
  },
  {
    dataField: "amount",
    text: "Amount",
  },
  {
    dataField: "paymentMode",
    text: "Payment Mode",
  },
];

const initialState = {
  edit: false,
  newCompanyName: "",
  newCompanyEmail: "",
  newCompanyLogoName: "",
  imgVersion: 0,
};

const loadingData = [
  {
    id: 1,
    fundCount: (
      <div className="table-one__loader">
        <FontAwesomeIcon icon={faCogs} size="5x" />
        <div>LOADING</div>
      </div>
    ),
  },
];

const prepopulatedData = [
  {
    id: 1,
    fundCount: (
      <div className="table-one__loader">
        <div>
          <b>
            <RouteButton to="/" value="Fund&nbsp;Now" />
          </b>
        </div>
      </div>
    ),
  },
];

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
    this.companyLogoInput = React.createRef();
  }

  componentDidMount() {
    this.props.fetchCorporateFunding();
  }

  handleEditClick = () => {
    this.setState({ edit: true });
  };

  handleEditCancelClick = () => {
    this.setState({ ...initialState });
  };

  handleEditSubmit = () => {
    const companyName = this.state.newCompanyName;
    const companyLogoName = this.state.newCompanyLogoName;

    const newForm = new FormData();
    newForm.append("companyName", companyName);
    newForm.append("companyLogoName", companyLogoName);
    newForm.append("companyLogo", this.companyLogoInput.current.files[0]);

    axios
      .post("/api/updateProfile", newForm)
      .then((resp) => {
        resp = resp.data;
        console.log("got the response at updateProfile: ", resp);
        if (resp.status === true) {
          this.setState({
            ...initialState,
            imgVersion: this.state.imgVersion + 1,
          });
          AddNoti("Success", "Profile updated successfuly", {
            type: "success",
          });
          localStorage.setItem("companyName", companyName);
          localStorage.setItem("companyLogoName", companyLogoName);
        } else {
          AddNoti("Error", resp.error || resp.message, { type: "error" });
        }
      })
      .catch((e) => {
        console.log("exception: ", e);

        AddNoti("Error", "someting went wrong", { type: "danger" });
      });
  };

  getUserFundData = () => {
    const fundData = this.props.corporateFunding.data;
    if (fundData.length === 0) {
      return null;
    }
    let retData = [];
    for (let i = 0; i < fundData.length; i++) {
      let fund = fundData[i];
      let paymentMode = getPaymentType(fund);
      if (paymentMode === null) continue;
      if (paymentMode === "txHash") {
        paymentMode = GetTxLink(fund.txHash);
      } else if (paymentMode === "paypalId") paymentMode = <div className="u-scroll-x">{fund.paypalId}</div>;
      retData.push({
        id: i,
        requestDate: GetDateLocalFormat(fund.createdAt),
        acceptDate: GetDateLocalFormat(parseFloat(fund.completionDate)),
        fundCount: fund.fundIds.length,
        amount: `$ ${fund.amountGoal}`,
        paymentMode: paymentMode,
      });
    }
    return retData;
  };

  render() {
    let companyName = localStorage.getItem("companyName"),
      companyEmail = localStorage.getItem("companyEmail"),
      companyLogoName = localStorage.getItem("companyLogoName"),
      uniqueId = localStorage.getItem("uniqueId");

    let defaultTable = (
      <BootstrapTable keyField="id" data={loadingData} columns={columns} />
    );

    if (this.props.corporateFunding) {
      let tableData = this.getUserFundData();
      if (tableData !== null)
        defaultTable = (
          <BootstrapTable keyField="id" data={tableData} columns={columns} />
        );
      else {
        defaultTable = (
          <BootstrapTable
            keyField="id"
            data={prepopulatedData}
            columns={columns}
          />
        );
      }
    }

    let leftForm = (
      <>
        <Row className="u-border-btm">
          <Col className="field-key" md="4" lg="4">
            Name
          </Col>
          <Col className="field-val" md="8" lg="8">
            <input type="text" value={companyName} disabled={true} />
          </Col>
        </Row>
        <Row className="u-border-btm">
          <Col className="field-key" md="4" lg="4">
            Email
          </Col>
          <Col className="field-val" md="8" lg="8">
            <input type="email" value={companyEmail} disabled={true} />
          </Col>
        </Row>
        <Row className="u-border-btm">
          <Col className="field-key" md="4" lg="4">
            Logo
          </Col>
          <Col className="field-val" md="8" lg="8">
            <input type="text" value={companyLogoName} disabled={true} />
          </Col>
        </Row>
        <Row>
          <Col md="4" lg="4" />
          <Col md="8" lg="8">
            <div className="logo-wrapper">
              <img
                className="logo"
                src={`https://newuat.blockdegree.org/img/funders/corporate/logos/${uniqueId}.png?v=${this.state.imgVersion}`}
              />
            </div>
          </Col>
        </Row>
      </>
    );

    let editBtn = (
      <Button className="std-btn" onClick={this.handleEditClick}>
        Edit
      </Button>
    );

    if (this.state.edit === true) {
      editBtn = (
        <Button className="std-btn" onClick={this.handleEditCancelClick}>
          Cancel
        </Button>
      );
      leftForm = (
        <>
          <Row className="u-border-btm">
            <Col className="field-key" md="4" lg="4">
              Name
            </Col>
            <Col className="field-val" md="8" lg="8">
              <input
                type="text"
                value={this.state.newCompanyName}
                onChange={(e) => {
                  this.setState({ newCompanyName: e.target.value });
                }}
              />
            </Col>
          </Row>
          <Row className="u-border-btm">
            <Col className="field-key" md="4" lg="4">
              Email
            </Col>
            <Col className="field-val" md="8" lg="8">
              <input type="email" value={companyEmail} disabled={true} />
            </Col>
          </Row>
          <Row className="u-border-btm">
            <Col className="field-key" md="4" lg="4">
              Logo
            </Col>
            <Col className="field-val" md="8" lg="8">
              <input
                type="file"
                label={this.state.newCompanyLogoName}
                accept="image/png"
                onChange={(e) => {
                  this.setState({
                    newCompanyLogoName: this.companyLogoInput.current.files[0]
                      .name,
                  });
                }}
                ref={this.companyLogoInput}
              />
            </Col>
          </Row>
          <div className="u-text-right">
            <Button className="std-btn" onClick={this.handleEditSubmit}>
              Update
            </Button>
          </div>
        </>
      );
    }

    return (
      <div className="main-panel">
        <RequireLogin />
        <div className="profile-page">
          <div className="profile-page__title">Profile</div>
          <div className="profile-page__content">
            <Container>
              <Row>
                <Col lg="12">
                  <div className="profile-page__content--note">
                    <b>Note :</b>
                    <ul>
                      <li>
                        The logo submitted during the registration/latest update
                        will be posted on the certificate
                      </li>
                      <li>
                        On changing the logo, logo on all the certificates
                        issued in the past and new certificates will be changed
                      </li>
                      <li>
                        For queires{" "}
                        <a
                          target="_blank"
                          href="https://www.blockdegree.org/contact"
                        >
                          contact here
                        </a>{" "}
                        or mail at <b>info@blockdegree.org</b>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
              <div className="u-right">{editBtn}</div>
              <Row>
                <Col lg="6">
                  <div className="card-left">
                    <div className="title">Company Details</div>
                    <hr />
                    {leftForm}
                  </div>
                </Col>
                <Col lg="6">
                  <div className="card-right">
                    <div className="title">Dummy Certificate</div>
                    <hr />
                    <div>
                      <img
                        src={`https://newuat.blockdegree.org/img/funders/corporate/dummy-certi/${uniqueId}.png?v=${this.state.imgVersion}`}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="table-one">{defaultTable}</div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
    );
  }
}

function getPaymentType({ txHash, paypalId, razorPayId }) {
  if (!_.isEmpty(txHash)) {
    return "txHash";
  } else if (!_.isEmpty(paypalId)) {
    return "paypalId";
  } else if (_.isEmpty(razorPayId)) {
    return "razorPayId";
  }
  return null;
}

function mapStateToProps({ auth, corporateFunding }) {
  return { auth, corporateFunding };
}

export default connect(mapStateToProps, actions)(Profile);
