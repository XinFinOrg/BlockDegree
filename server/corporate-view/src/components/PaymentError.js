import React from "react";
import { Row, Col, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { GetParamValue } from "../helpers/constant";

function PaymentSuccess() {
  const invoiceNumber = GetParamValue("invoice_number");
  const message = GetParamValue("message");

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
                    <div className="message__icon error">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        size="10x"
                      ></FontAwesomeIcon>
                    </div>
                  </Col>
                  <Col sm="12" md="8" lg="8">
                    <div className="message__body--title">Payment Error</div>
                    <hr />
                    <br />

                    <div className="message__body--content">
                      Something went wrong while processing your payment, please
                      contact <b>info@blockdegree.org</b>
                      <br />
                      Drop a mail, and we'll get in touch with you shortly!
                      <hr />
                      Your invoice number is <b>{invoiceNumber}</b>
                    </div>
                    <hr />
                    {footerText}
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
