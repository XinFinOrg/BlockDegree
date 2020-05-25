import React from "react";
import { Row, Col, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { GetParamValue } from "../helpers/constant";

function PaymentSuccess() {
  const invoiceNumber = GetParamValue("invoice_number");
  const message = GetParamValue("message");

  console.log("invoice number: ",invoiceNumber);
  

  let footerText = <></>;
  if (invoiceNumber !== null) {
    footerText = (
      <>
        Your invoice number is <b>{invoiceNumber}</b>
      </>
    );
  } else if (message !== null) {
    footerText = (
      <>
        Message: <b>{message}</b>
      </>
    );
  }

  return (
    <>
      <div className="main-panel">
        <div className="message-page">
          <div className="message">
            <div className="message__body">
              <Container>
                <Row>
                  <Col sm="12" md="4" lg="4">
                    <div className="message__icon success">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size="10x"
                      ></FontAwesomeIcon>
                    </div>
                  </Col>
                  <Col sm="12" md="8" lg="8">
                    <div className="message__body--title">Payment Success</div>
                    <hr />
                    <br />

                    <div className="message__body--content">
                      Your transaction is now completed.
                      <br />
                      Thank you for your support!
                      <hr />
                      {footerText}
                    </div>
                    <hr />
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccess;
