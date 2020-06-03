import React, { Component } from "react";
import { Accordion, Card, Button } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import ScrollToTop from "../hooks/ScrollToTop";

class Faq extends Component {
  render() {
    return (
      <div>
        <ScrollToTop />
        <div className="main-panel">
          <div className="faq-page">
            <div className="faq-page__title">FAQ</div>
            <div className="faq-page__content">
              <div className="faq-page__content--accordion">
                <Accordion>
                  <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="0">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      &nbsp;Do Blockdegree have an option to do anonymous
                      donation/ Sponsorship? Yes. In this case no name will be
                      displayed on the certificate.
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                      <Card.Body>
                        Yes. In this case no name will be displayed on the
                        certificate.
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                  <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="1">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      &nbsp;Do Blockdegree have an option for recurring
                      Donation / Sponsorship?
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="1">
                      <Card.Body>
                        Yes. using paypal, you can set up a
                        weekly/monthly/yearly budget for the donation /
                        sponsorship.
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>

                  <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="2">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      &nbsp;I am unable to fund the students but I like to work
                      as a volunteer to collect Sponsorship / Donation How can I
                      start?
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="2">
                      <Card.Body>
                        Please become a Campus Ambassadors and start your
                        volunteer activities to help students to get sponsorship
                        / donation. Please Apply Here.
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Faq;
