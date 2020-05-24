import React from "react";
import Modal from "react-bootstrap/Modal";
import { Row, Col, Container, Button } from "react-bootstrap";

function PaymentModal(props) {
  return (
    <Modal
      onHide={props.onHide}
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="payment-modal blockdegree-modal"
    >
      <Modal.Header className="payment-modal__header" closeButton>
        <Modal.Title className="payment-modal__header--title">
          Select Payment Mode
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="payment-modal__body">
        <Container>
          <Row>
            <Col>
              <Button onClick={props.paypalOnClick}>PayPal</Button>
            </Col>
            <Col>
              <Button onClick={props.xdcWalletOnClick}>XDC Wallet</Button>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default PaymentModal;
