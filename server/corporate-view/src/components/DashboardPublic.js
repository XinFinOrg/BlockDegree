import React, { Component } from "react";
import { Row, Col, Container } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";

import { RoundDgt } from "../helpers/constant";

import funders from "../assets/img/funders.png";

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
                  <div className="primary-text">Corporate Funding</div>
                </div>
                <hr />
                <div className="banner__hero">
                  <img
                    className="banner-left__hero"
                    src={funders}
                    alt="funders image"
                  />
                </div>
                <div className="banner__content">
                  <div className="secondary-text">
                    Silent sir say desire fat him letter. Whatever settling
                    goodness too and honoured she building answered her.
                    Strongly thoughts remember mr to do consider debating.{" "}
                  </div>
                </div>
              </div>
            </Col>
            <Col className="lg-hori-1" lg={4}>
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
        </Container>
      </div>
    );
  }
}

export default Dashboard;
