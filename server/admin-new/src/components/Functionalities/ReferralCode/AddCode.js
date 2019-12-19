import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class AddReferralCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeName: "",
      purpose: "",
      referrerEmail: ""
    };

    this.handleCodeNameChange = this.handleCodeNameChange.bind(this);
    this.handlePurposeChange = this.handlePurposeChange.bind(this);
    this.handleReferrerEmailChange = this.handleReferrerEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCodeNameChange(event) {
    this.setState({ codeName: event.target.value });
  }

  handlePurposeChange(event) {
    this.setState({ purpose: event.target.value });
  }

  handleReferrerEmailChange(event) {
    this.setState({ referrerEmail: event.target.value });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit() {
    const codeNameValid = validate("code", this.state.codeName);
    const referrerEmailValid = validate("email", this.state.referrerEmail);
    const purposeValid = validate("text", this.state.purpose);

    if (!codeNameValid) {
      return showNotification("danger", "Add Referral Code", "Invalid code name");
    }
    if (!purposeValid) {
      return showNotification("danger", "Add Referral Code", "Invalid purpose");
    }
    if (!referrerEmailValid) {
      return showNotification(
        "danger",
        "Add Referral Code",
        "Invalid  referrer email"
      );
    }

    // data is valid
    axios
      .post("/api/addReferralCode", {
        referralCode: this.state.codeName,
        purpose: this.state.purpose,
        referrerEmail: this.state.referrerEmail
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Added new referral code!",
            codeName: "",
            purpose: "",
            referrerEmail: ""
          });
        } else {
          // show error
          this.setState({
            showError: true,
            errorMsg: resp.data.error
          });
        }
      })
      .catch(err => {
        //  err.response.data.error
        console.log(err.response.data);
        this.setState({
          showError: true,
          errorMsg: err.response.data.error
        });
      });
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Add Referral Code</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Code name</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.codeName}
                  onChange={this.handleCodeNameChange}
                  placeholder="referral code name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Referrer's Email</label>
              <div className="col-md-4">
                <input
                  type="text"
                  value={this.state.referrerEmail}
                  onChange={this.handleReferrerEmailChange}
                  placeholder="referrer email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Purpose</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.purpose}
                  onChange={this.handlePurposeChange}
                  placeholder="purpose"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4"></label>
              <div className="col-md-8">
                <button
                  type="button"
                  onClick={this.handleSubmit}
                  className="right btn btn-fill btn-info"
                >
                  Add Referral
                </button>
              </div>
            </div>
          </form>
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
      </div>
    );
  }
}

function showNotification(type, title, message) {
  store.addNotification({
    title: title,
    message: message,
    type: type,
    insert: "top",
    container: "top-right",
    animationIn: ["animated", "fadeIn"],
    animationOut: ["animated", "fadeOut"],
    width: 200,
    dismiss: {
      duration: 3000,
      onScreen: true
    }
  });
}

export default AddReferralCode;
