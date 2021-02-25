import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Collapse } from "react-bootstrap";

// prettier-ignore
class Nav extends Component {

  state = {};

  render() {
    let { location } = this.props;
    return (
      <ul className="nav nav-sidebar">

        <li className={location.pathname === '/' ? 'active' : null}>
          <Link to="/">
            <i className="pe-7s-display1"></i>
            <p>Dashboard</p>
          </Link>
        </li>

        <li className={location.pathname === '/weekly-stats' ? 'active' : null}>
          <Link to="/weekly-stats">
            <i className="pe-7s-graph1"></i>
            <p>Weekly Statistics</p>
          </Link>
        </li>

        <li className={this.isPathActive('/tables') || this.state.tablesMenuOpen ? 'active' : null}>
          <a onClick={() => this.setState({ tablesMenuOpen: !this.state.tablesMenuOpen })} data-toggle="collapse">
            <i className="pe-7s-server"></i>
            <p>Tables <b className="caret"></b></p>
          </a>
          <Collapse in={this.state.tablesMenuOpen}>
            <div>
              <ul className="nav">
                <li className={this.isPathActive('/tables/users') ? 'active' : null}>
                  <Link to="/tables/users">User Table</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/kyc-user') ? 'active' : null}>
                  <Link to="/tables/kyc-user">KYC Table</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/promocodes') ? 'active' : null}>
                  <Link to="/tables/promocodes">Promocode Table</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/certificates') ? 'active' : null}>
                  <Link to="/tables/certificates">Certificates Table</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/referrer-codes') ? 'active' : null}>
                  <Link to="/tables/referrer-codes">Referral Codes Table</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/user-sessions') ? 'active' : null}>
                  <Link to="/tables/user-sessions">User Sessions Table</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/fund-my-degree') ? 'active' : null}>
                  <Link to="/tables/fund-my-degree">Fund My Degree</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/referals') ? 'active' : null}>
                  <Link to="/tables/referals">Referal Users</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/tables/razor-pay-log') ? 'active' : null}>
                  <Link to="/tables/razor-pay-log">Razor Pay Log</Link>
                </li>
              </ul>
            </div>
          </Collapse>
        </li>



        <li className={this.isPathActive('/functionalities') || this.state.functionalitiesMenuOpen ? 'active' : null}>
          <a onClick={() => this.setState({ functionalitiesMenuOpen: !this.state.functionalitiesMenuOpen })} data-toggle="collapse">
            <i className="pe-7s-tools"></i>
            <p>Functionalities <b className="caret"></b></p>
          </a>
          <Collapse in={this.state.functionalitiesMenuOpen}>
            <div>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/promocodes') ? 'active' : null}>
                  <Link to="/functionalities/promocodes">PromoCodes</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/referral-codes') ? 'active' : null}>
                  <Link to="/functionalities/referral-codes">Referral Codes</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/course-payment') ? 'active' : null}>
                  <Link to="/functionalities/course-payment">Course Payment</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/wallet-config') ? 'active' : null}>
                  <Link to="/functionalities/wallet-config">Wallet Config</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/events') ? 'active' : null}>
                  <Link to="/functionalities/events">Events</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/fmd') ? 'active' : null}>
                  <Link to="/functionalities/fmd">Fund My Degree</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/functionalities/site-statistics') ? 'active' : null}>
                  <Link to="/functionalities/site-statistics">Site Statistics</Link>
                </li>
              </ul>
            </div>
          </Collapse>
        </li>



        <li className={this.isPathActive('/txlogs') || this.state.txLogsMenuOpen ? 'active' : null}>
          <a onClick={() => this.setState({ txLogsMenuOpen: !this.state.txLogsMenuOpen })} data-toggle="collapse">
            <i className="pe-7s-news-paper"></i>
            <p>Tx logs <b className="caret"></b></p>
          </a>
          <Collapse in={this.state.txLogsMenuOpen}>
            <div>
              <ul className="nav">
                <li className={this.isPathActive('/txlogs/promocode-logs') ? 'active' : null}>
                  <Link to="/txlogs/promocode-logs">PromoCode Logs</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/txlogs/payment-logs') ? 'active' : null}>
                  <Link to="/txlogs/payment-logs">Payment Logs</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/txlogs/burn-logs') ? 'active' : null}>
                  <Link to="/txlogs/burn-logs">Burn Logs</Link>
                </li>
              </ul>
              <ul className="nav">
                <li className={this.isPathActive('/txlogs/crypto-logs') ? 'active' : null}>
                  <Link to="/txlogs/crypto-logs">Crypto Logs</Link>
                </li>
              </ul>
            </div>
          </Collapse>
        </li>
        {/* // pe-7s-power */}
        <li className="btn-logout">
          <a href="/logout">  <i className="pe-7s-power"></i><p>Logout</p></a>
        </li>

        {/* <li className={location.pathname === '/dashboard-old' ? 'active' : null}>
          <Link to="/dashboard-old">
            <i className="pe-7s-graph"></i>
            <p>Dashboard-Old</p>
          </Link>
        </li>

        <li className={this.isPathActive('/components-old') || this.state.componentMenuOpen ? 'active' : null}>
          <a onClick={() => this.setState({ componentMenuOpen: !this.state.componentMenuOpen })}
            data-toggle="collapse">
            <i className="pe-7s-plugin"></i>
            <p>
              Components
            <b className="caret"></b>
            </p>
          </a>
          <Collapse in={this.state.componentMenuOpen}>
            <div>
              <ul className="nav">
                <li className={this.isPathActive('/components-old/buttons-old') ? 'active' : null}>
                  <Link to="/components-old/buttons-old">Buttons</Link>
                </li>
                <li className={this.isPathActive('/components-old/grid-old') ? 'active' : null}>
                  <Link to="/components-old/grid-old">Grid System</Link>
                </li>
                <li className={this.isPathActive('/components-old/icons-old') ? 'active' : null}>
                  <Link to="/components-old/icons-old">Icons</Link>
                </li>
                <li className={this.isPathActive('/components-old/notifications-old') ? 'active' : null}>
                  <Link to="/components-old/notifications-old">Notifications</Link>
                </li>
                <li className={this.isPathActive('/components-old/panels-old') ? 'active' : null}>
                  <Link to="/components-old/panels-old">Panels</Link>
                </li>
                <li className={this.isPathActive('/components-old/sweetalert-old') ? 'active' : null}>
                  <Link to="/components-old/sweetalert-old">Sweet Alert</Link>
                </li>
                <li className={this.isPathActive('/components-old/typography-old') ? 'active' : null}>
                  <Link to="/components-old/typography-old">Typography</Link>
                </li>
              </ul>
            </div>
          </Collapse>
        </li>
        <li className={this.isPathActive('/forms-old') || this.state.formMenuOpen ? 'active' : null}>
          <a onClick={() => this.setState({ formMenuOpen: !this.state.formMenuOpen })} data-toggle="collapse">
            <i className="pe-7s-note2"></i>
            <p>Forms <b className="caret"></b></p>
          </a>
          <Collapse in={this.state.formMenuOpen}>
            <div>
              <ul className="nav">
                <li className={this.isPathActive('/forms-old/regular-forms-old') ? 'active' : null}>
                  <Link to="/forms-old/regular-forms-old">Regular Forms</Link>
                </li>
                <li className={this.isPathActive('/forms-old/extended-forms-old') ? 'active' : null}>
                  <Link to="/forms-old/extended-forms-old">Extended Forms</Link>
                </li>
                <li className={this.isPathActive('/forms-old/validation-forms-old') ? 'active' : null}>
                  <Link to="/forms-old/validation-forms-old">Validation Forms</Link>
                </li>
              </ul>
            </div>
          </Collapse>
        </li>

        <li className={this.isPathActive('/maps-old') || this.state.mapMenuOpen ? 'active' : null}>
          <a onClick={() => this.setState({ mapMenuOpen: !this.state.mapMenuOpen })} data-toggle="collapse">
            <i className="pe-7s-map-marker"></i>
            <p>Map <b className="caret"></b></p>
          </a>
          <Collapse in={this.state.mapMenuOpen}>
            <div>
              <ul className="nav">
                <li className={this.isPathActive('/maps-old/google-map-old') ? 'active' : null}>
                  <Link to="/maps-old/google-map-old">Google Map</Link>
                </li>
                <li className={this.isPathActive('/maps-old/vector-map-old') ? 'active' : null}>
                  <Link to="/maps-old/vector-map-old">Vector Map</Link>
                </li>
              </ul>
            </div>
          </Collapse>
        </li>
        <li className={this.isPathActive('/charts-old') ? 'active' : null}>
          <Link to="/charts-old">
            <i className="pe-7s-graph"></i>
            <p>Charts</p>
          </Link>
        </li>
        <li className={this.isPathActive('/calendar-old') ? 'active' : null}>
          <Link to="/calendar-old">
            <i className="pe-7s-date"></i>
            <p>Calendar</p>
          </Link>
        </li> */}
      </ul>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }
}

export default withRouter(Nav);
