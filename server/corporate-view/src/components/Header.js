import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../actions/index";
import axios from "axios";
import blockdegree_icon from "../assets/img/blockdegree_icon_white.png";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPowerOff,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import RouteButton from "../hooks/RouteButton";

const initialAuth = localStorage.getItem("corp-auth-status");

class Header extends Component {
  constructor(props) {
    super(props);

    this.renderAccount = this.renderAccount.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
    this.props.fetchCorporateUser();
  }

  handleLogout() {
    axios.get("/api/logout-corp").then(() => {
      this.props.fetchCorporateUser();
    });
  }

  renderLogin() {
    return (
      <div className="navbar__links">
        <Nav>
          <RouteButton className="u-back-light" to={"/login"} value={<Nav.Link>Log In</Nav.Link>} />
          <RouteButton className="u-back-light" to={"/signup"} value={<Nav.Link>Sign Up</Nav.Link>} />
        </Nav>
      </div>
    );
  }

  renderAccount() {
    return (
      <div className="navbar__dropdown">
        <Nav>
          <NavDropdown
            title={
              <span>
                <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                &nbsp;&nbsp;Account&nbsp;&nbsp;
              </span>
            }
            alignRight
            id="basic-nav-dropdown"
          >
            <RouteButton
              to={"/"}
              value={
                <NavDropdown.Item>
                  <>
                    <FontAwesomeIcon icon={faDesktop}></FontAwesomeIcon>
                    &nbsp;&nbsp;Dashboard
                  </>
                </NavDropdown.Item>
              }
            />     
            <RouteButton
              to={"/profile"}
              value={
                <NavDropdown.Item>
                  <>
                    <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                    &nbsp;&nbsp;Profile
                  </>
                </NavDropdown.Item>
              }
            />        

            <NavDropdown.Item onClick={this.handleLogout}>
              <>
                <FontAwesomeIcon icon={faPowerOff}></FontAwesomeIcon>
                &nbsp;&nbsp;Logout
              </>
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
          <RouteButton
            className="navbar__brand"
            to={"/"}
            value={
              <>
                <img
                  src={blockdegree_icon}
                  width="55"
                  height="40"
                  className="d-inline-block align-top"
                  alt="React Bootstrap logo"
                />
                <Navbar.Brand>&nbsp;Corporate Funding</Navbar.Brand>
              </>
            }
          />

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse
            id="responsive-navbar-nav"
            className="justify-content-end"
          >
            {this.props.auth
              ? this.props.auth.auth === true
                ? this.renderAccount()
                : this.renderLogin()
              : initialAuth == "true"
              ? this.renderAccount()
              : this.renderLogin()}
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps, actions)(Header);
