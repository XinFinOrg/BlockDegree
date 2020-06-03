import React from "react";
import RouteButton from "../hooks/RouteButton";
import { Container, Row, Col } from "react-bootstrap";
import blockdegree_icon from "../assets/img/blockdegree_icon_white.png";

function Footer() {
  return (
    <div className="footer">
      <Container>
        <Row>
          <Col className="one" lg="3">
            <div className="title">About</div>
            <div className="desc">
              <ul>
                <li>
                  Blockdegree.org is an online blockchain training platform.
                  <br />
                  Visit main site{" "}
                  <a target="_blank" href="https://www.blockdegree.org">
                    Blockedgree.org
                  </a>
                </li>
              </ul>
            </div>
          </Col>
          <Col className="two" lg="3">
            <div className="title">Useful Links</div>
            <div className="desc">
              <ul>
                <li>
                  <RouteButton to="/faq" value="FAQ" className="link" />
                </li>
              </ul>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="footer__bottom" lg="12" md="12" sm="12">
            Blockdegree.org
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Footer;
