import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

/**
 *
 *
 */

class FacebookRefresh extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastUpdate: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.popupLogin = this.popupLogin.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.fetchFacebookTokenLastUpdate = this.fetchFacebookTokenLastUpdate.bind(
      this
    );
  }

  componentDidMount() {
    window.addEventListener("message", this.handleSuccess, false);
    this.fetchFacebookTokenLastUpdate();
  }

  handleSuccess = event => {
    if (
      event.origin === "https://www.blockdegree.org" ||
      event.origin === "https://blockdegree.org"
    ) {
      console.log("From PopUp", event.data);
      this.setState({ showSuccess: true });
      this.fetchFacebookTokenLastUpdate();
    }
  };

  popupLogin(options) {
    options.windowName = options.windowName || "ConnectWithOAuth"; // should not include space for IE
    options.windowOptions =
      options.windowOptions || "location=0,status=0,width=600,height=600";
    options.callback =
      options.callback ||
      function() {
        window.location.reload();
      };
    var that = this;
    that._oauthWindow = window.open(
      "https://www.blockdegree.org/admin/facebookRefresh?close=true",
      options.windowName,
      options.windowOptions
    );
  }

  fetchFacebookTokenLastUpdate() {
    // facebookTokenTimeToExpire
    axios
      .get("/api/fetchFacebookLastUpdate")
      .then(resp => {
        console.log("Response at fetchTimeToExpire: ", resp);
        if (resp.data.status === true) {
          console.log("all ok");
          this.setState({ lastUpdate: resp.data.lastUpdate });
        } else {
          this.setState({ showError: true, errorMsg: resp.data.error });
        }
      })
      .catch(e => {
        console.log("Exception at fetchTimeToExpire: ", e);
        this.setState({ showError: true, errorMsg: e });
      });
  }

  handleSubmit() {
    console.log("called facebook refresh token");
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Refresh Facebook Token</h4>
        </div>

        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="control-label col-md-4">Last Update:</label>
              <div className="col-md-8">
                {new Date(parseFloat(this.state.lastUpdate)).toString()}
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-3"></label>
              <div className="col-md-9">
                <button
                  type="button"
                  onClick={this.popupLogin}
                  className="right btn btn-fill btn-info"
                >
                  Refresh Token
                </button>
              </div>
            </div>
          </form>
        </div>

        <Alert
          title="Success"
          show={this.state.showSuccess}
          text={this.state.successMsg}
          type="success"
          onConfirm={() =>
            this.setState({ showSuccess: false, successMsg: "success" })
          }
        />
        <Alert
          title="Error"
          show={this.state.showError}
          text={this.state.errorMsg}
          type="error"
          onConfirm={() =>
            this.setState({ showError: false, errorMsg: "error" })
          }
        />
      </div>
    );
  }
}

export default FacebookRefresh;
