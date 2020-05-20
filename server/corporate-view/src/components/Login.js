import React, { Component } from "react";
import { connect } from "react-redux";
import Formdata from "form-data";
import { Redirect } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { AddNoti } from "../helpers/Notification";
import RequireLogin from "../middleware/RequireLogin";
import { GetParamValue } from "../helpers/constant";
import RequireLogout from "../middleware/RequireLogout";
import axios from "axios";

const initialState = {
  companyName: "",
  companyEmail: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyLogo: null,
  redirect: false,
};

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.companyLogoInput = React.createRef();

    this.handleLogInPost = this.handleLogInPost.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  setRedirect = () => {
    this.setState({
      redirect: true,
    });
  };

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to="/" />;
    }
  };

  handleLogInPost() {
    const companyEmail = this.state.companyEmail;
    const password = this.state.password;

    const newForm = new Formdata();
    newForm.append("companyEmail", companyEmail);
    newForm.append("password", password);

    axios
      .post("/api/login-corp", newForm)
      .then((resp) => {
        resp = resp.data;
        console.log("inside login post: ", resp);

        if (resp.status === true) {
          localStorage.setItem("corp-auth-status", "true");
          localStorage.setItem(
            "corp-auth-ts",
            Date.now()+""
          );
          AddNoti("Welcome", "Login Successful!");
          let givenRedirect = GetParamValue("from");
          if (givenRedirect === null) givenRedirect = "/";
          else givenRedirect = "/" + givenRedirect;
          this.setState({
            ...initialState,
            redirect: true,
            redirectTo: givenRedirect,
          });
        } else {
          AddNoti("Error", resp.error);
        }
      })
      .catch((e) => {});
  }

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
                  <div className="center-form__title">Log In</div>
                  <hr />
                  <div className="center-form__content">
                    <Form>
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

                      <Button
                        variant="primary"
                        type="button"
                        onClick={this.handleLogInPost}
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

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, null)(SignUp);
