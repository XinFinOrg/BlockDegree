import React, { Component } from "react";
import { Row, Col, Container, Card } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";

import RouteButton from "../hooks/RouteButton";
import { RoundDgt } from "../helpers/constant";

import funders from "../assets/img/funders.png";
import dummyCerti from "../assets/img/dummy-certi.png";

class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let siteStats = this.props.stats;
    let bannerRightContent;
    if (siteStats) {
      bannerRightContent = (
        <div className="banner__content">
          <div className="banner-right__tuple">
            <span className="banner-right__tuple--title">
              {siteStats.userCnt} Students
            </span>
            <span className="banner-right__tuple--content">
              have registered on Blockdegree.org
            </span>
          </div>
          <hr />

          <div className="banner-right__tuple">
            <span className="banner-right__tuple--title">
              {siteStats.totCertis} Students
            </span>
            <span className="banner-right__tuple--content">
              are now certified professionals on Blockdegree.org
            </span>
          </div>
          <hr />

          <div className="banner-right__tuple">
            <span className="banner-right__tuple--title">
              {siteStats.fmdReqCnt} Students
            </span>
            <span className="banner-right__tuple--content">
              are waiting for funding worth ${siteStats.fmdReqAmnt} or{" "}
              {RoundDgt(siteStats.fmdReqAmntXdc, 3)} XDC
            </span>
          </div>
          <hr />

          <div className="banner-right__tuple">
            <span className="banner-right__tuple--title">
              {siteStats.fmdFundedCnt} Students
            </span>
            <span className="banner-right__tuple--content">
              got funded for a total of ${siteStats.fmdFundedAmnt} or{" "}
              {RoundDgt(siteStats.fmdFundedAmntXdc, 3)} XDC
            </span>
          </div>
          <hr />

          <div className="banner-right__tuple">
            <span className="banner-right__tuple--title">
              {siteStats.caCnt} Campus Ambassadors
            </span>
            <span className="banner-right__tuple--content">
              have been registered at Blockdegree.org
            </span>
          </div>
        </div>
      );
    } else {
      bannerRightContent = (
        <div className="banner__content">
          <div className="banner-right__tuple">
            <div className="table-one__loader">
              <FontAwesomeIcon icon={faCogs} size="5x" />
              <div>LOADING</div>
            </div>
          </div>
          <hr />
        </div>
      );
    }

    return (
      <div className="banner-wrapper">
        <Container>
          <Row>
            <Col className="lg-hori-1" lg={8}>
              <div className="banner banner-left">
                <div className="banner__title">
                  <div className="primary-text">
                    Blockdegree Corporate Funding
                  </div>
                </div>
                <hr />
                <Row>
                  <Col className="lg-hori-1 u-no-pad-r" lg={6} md={6}>
                    <div className="banner__hero">
                      <img
                        className="banner-left__hero"
                        src={funders}
                        alt="funders image"
                      />
                    </div>
                  </Col>
                  <Col className="lg-hori-1 u-no-pad-" lg={6} md={6}>
                    <div className="banner__content u-text-left">
                      <div className="secondary-text">
                        <ul className="u-no-list">
                          <li>
                            Blockdegree Provides Free Course access to all the
                            students and if students wish to go for examination
                            & certification then blockdegree charges USD 9.99
                            fees.
                          </li>
                          <hr />
                          <li>
                            This fee is to cover infrastructure and storage
                            costs for the certificates
                          </li>
                          <hr />
                        </ul>
                      </div>
                    </div>
                  </Col>
                  <Col
                    className="banner__footer secondary-text"
                    lg={12}
                    md={12}
                  >
                    Blockdegree has Students from many underdeveloped countries.
                    These students like to go for exam & certification but are
                    unable to pay the fees.
                    <br />
                    <a href="https://www.blockdegree.org/fmd" target="_blank">
                      FundMyDegree
                    </a>
                    &nbsp;provides them the option to request for the funding
                    for their certification.{" "}
                    <RouteButton
                      className="btn-sign-up"
                      to="/signup"
                      value="Sign Up"
                    />{" "}
                    to start funding!
                  </Col>
                </Row>
              </div>
            </Col>
            <Col className="lg-hori-1 u-no-pad-l--lg" lg={4}>
              <div className="banner banner-right">
                <div className="banner__title">
                  <div className="primary-text">Funding Statistics</div>
                </div>
                <hr />
                <br />
                {bannerRightContent}
              </div>
            </Col>
          </Row>
          <br />
          <Row>
            <Col className="funding-benefits">
              <div className="funding-benefits__title">
                Benefits Of Funding
                <hr />
              </div>

              <Row className="funding-benefits__content">
                <Col className="funding-benefits__content--card" lg={4} md={6} sm={12}>
                  When you sponsor a Student's fees and certification Your
                  Personal name or Corporate Logo will be displayed on each
                  certificate sponsored by you.
                  <br />
                  You will get Thank You Certificate from Blockdegree which you
                  can Share on your Social Media.
                </Col>
                <Col className="funding-benefits__content--card" lg={4} md={6} sm={12}>
                  Corporate, NGO's and government bodies have the option to
                  sponsor bulk numbers of students. All the sponsored
                  certificates will have the name and logo of the sponsor. I
                  wish to sponsor __ Certificate
                </Col>
                <Col className="funding-benefits__content--img" lg={3} md={6} sm={12}>
                  <img src={dummyCerti} />
                </Col>
              </Row>
            </Col>
            {/* <Col sm="12" md="5" lg="5">
              <div className="custom-card">
                <div className="custom-card__title">
                  Built on <b>XDC Network</b>
                </div>
                <div className="custom-card__content">
                  <img
                    src="https://blockdegree.org/img/partners/xdc_logo.png"
                    alt="xdc logo"
                  />
                </div>
              </div>
            </Col>
            <Col sm="12" md="5" lg="5">
              <div className="custom-card">
                {" "}
                <div className="custom-card__title">Entire Course Payment</div>
                <div className="custom-card__content">
                  <div className="custom-card__content--text">
                    <br />
                    We provide several options for you to donate.
                    <br /> Apart from <b>Paypal</b>, you also have the option to
                    pay through <b>XDC Coin</b> or <b>Mobile Payments</b>.
                    <br />
                    If you are looking at Entire Course sponsoring then{" "}
                    <a
                      href="https://www.blockdegree.org/contact"
                      target="_blank"
                    >
                      Please&nbsp;Contact&nbsp;Us
                    </a>
                    <br />
                    You can also mail at <b>info@blockdegree.org</b>
                    <br />
                  </div>
                </div>
              </div>
            </Col> */}
          </Row>
        </Container>
      </div>
    );
  }
}

export default Dashboard;
