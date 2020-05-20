import React, { Component } from "react";
import { Row, Col, Container } from "react-bootstrap";
import funders from "../assets/img/funders.png";

class Dashboard extends Component {
  render() {
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
                <div className="banner__content">
                  <div className="banner-right__tuple">
                    <span className="banner-right__tuple--title">
                      6000 Students
                    </span>
                    <span className="banner-right__tuple--content">
                      have registered on Blockdegree.org
                    </span>
                  </div>
                  <hr />

                  <div className="banner-right__tuple">
                    <span className="banner-right__tuple--title">
                      1500 Students
                    </span>
                    <span className="banner-right__tuple--content">
                      are now certified professionals on Blockdegree.org
                    </span>
                  </div>
                  <hr />

                  <div className="banner-right__tuple">
                    <span className="banner-right__tuple--title">
                      200 Funding Requests
                    </span>
                    <span className="banner-right__tuple--content">
                      have been generated worth $2000 or 1000000 XDC
                    </span>
                  </div>
                  <hr />

                  <div className="banner-right__tuple">
                    <span className="banner-right__tuple--title">
                      50 Students
                    </span>
                    <span className="banner-right__tuple--content">
                      got funded for a total of $500 or 1000000 XDC
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Dashboard;
