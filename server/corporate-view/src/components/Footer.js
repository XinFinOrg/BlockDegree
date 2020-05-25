import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import blockdegree_icon from "../assets/img/blockdegree_icon_white.png";

function Footer() {
  return (
    <div className="footer">
      <Container>
        <Row>
          <Col className="one" lg="3">
            <div className="icon-wrap">
              <img className="icon" src={blockdegree_icon}></img>
            </div>
            <div className="title">Blockdegree.Org</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Footer;
