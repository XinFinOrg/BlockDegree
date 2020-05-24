import React, { Component } from "react";
import Formdata from "form-data";
import { Redirect } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import RequireLogout from "../middleware/RequireLogout";
import axios from "axios";

import { AddNoti } from "../helpers/Notification";
import { GetParamValue } from "../helpers/constant";
import { BytesToMB } from "../helpers/constant";

const initialState = {
  companyName: "",
  companyEmail: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyLogo: null,
  companyLogoName: "Please Select File",
  redirect: false,
  redirectTo: "/",
};

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.companyLogoInput = React.createRef();

    this.handleSignUpPost = this.handleSignUpPost.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  handleSignUpPost() {
    const companyName = this.state.companyName;
    const companyEmail = this.state.companyEmail;
    const companyLogo = this.companyLogoInput.current.files[0];
    const password = this.state.password;
    const companyLogoName = this.state.companyLogoName;

    const newForm = new Formdata();
    newForm.append("companyEmail", companyEmail);
    newForm.append("password", password);
    newForm.append("companyLogo", companyLogo);
    newForm.append("companyLogoName", companyLogoName);
    newForm.append("companyName", companyName);

    axios
      .post("/api/signup-corp", newForm)
      .then((resp) => {
        resp = resp.data;
        if (resp.status === true) {
          AddNoti("Sign-up successful", "Please login to continue!", {
            type: "success",
          });
          let givenRedirect = GetParamValue("from");
          this.setState({
            ...initialState,
            redirect: true,
            redirectTo: "/login",
          });
          } else {
          console.log(resp);

          AddNoti("Error in sign-up", resp.error || resp.message, {
            type: "error",
          });
        }
      })
      .catch(console.log);
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirectTo} />;
    }
  };

  render() {
    return (
      <div>
        <RequireLogout />
        {this.renderRedirect()}
        <div className="sign-up">
          <Container>
            <Row>
              <Col></Col>
              <Col lg="5">
                <div className="center-form">
                  <div className="center-form__title">Sign Up</div>
                  <hr />
                  <div className="center-form__content">
                    <Form>
                      <Form.Group controlId="formBasicName">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Company Name"
                          value={this.state.companyName}
                          onChange={(e) => {
                            this.setState({ companyName: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={this.state.companyEmail}
                          onChange={(e) => {
                            this.setState({ companyEmail: e.target.value });
                          }}
                        />
                        <Form.Text className="text-muted">
                          We'll never share your email with anyone else.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          value={this.state.password}
                          onChange={(e) => {
                            this.setState({ password: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="formBasicCfmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          value={this.state.confirmPassword}
                          onChange={(e) => {
                            this.setState({ confirmPassword: e.target.value });
                          }}
                        />
                      </Form.Group>

                      <Form.Group controlId="formBasicCompanyLogo">
                        <Form.Label>Company Logo</Form.Label>
                        <Form.File
                          id="custom-file"
                          label={this.state.companyLogoName}
                          custom
                          ref={this.companyLogoInput}
                          accept="image/png"
                          onChange={() => {
                            console.log(
                              "Size: ",
                              BytesToMB(
                                this.companyLogoInput.current.files[0].size
                              )
                            );
                            let newImg = new Image();
                            this.setState({
                              companyLogoName: this.companyLogoInput.current
                                .files[0].name,
                            });
                          }}
                        />
                        <Form.Text className="text-muted">
                          Max size is 5MB
                        </Form.Text>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="button"
                        onClick={this.handleSignUpPost}
                      >
                        Submit
                      </Button>
                    </Form>
                  </div>
                </div>
              </Col>
              <Col></Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default SignUp;
