import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class AddPromoCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeName: "",
      discAmt: 0,
      purpose: "",
      restricted: "false",
      errorMsg: "Error",
      successMsg: "Success"
    };

    this.handleCodeNameChange = this.handleCodeNameChange.bind(this);
    this.handleDiscAmtChange = this.handleDiscAmtChange.bind(this);
    this.handlePurposeChange = this.handlePurposeChange.bind(this);
    this.handleRestrictChange = this.handleRestrictChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCodeNameChange(event) {
    this.setState({ codeName: event.target.value });
  }

  handleDiscAmtChange(event) {
    this.setState({ discAmt: event.target.value });
  }

  handlePurposeChange(event) {
    this.setState({ purpose: event.target.value });
  }

  handleRestrictChange(event) {
    this.setState({ restricted: event.target.value });
  }
  // type, title, message
  handleSubmit() {
    const codeNameValid = validate("code", this.state.codeName);
    const purposeValid = validate("text", this.state.purpose);
    const discValid = validate("float", this.state.discAmt);
    const restricted = this.state.restricted;
    if (!codeNameValid) {
      return showNotification("danger", "Add Promo Code", "Invalid code name");
    }
    if (!purposeValid) {
      return showNotification("danger", "Add Promo Code", "Invalid purpose");
    }
    if (!discValid || this.state.discAmt <= 0) {
      return showNotification(
        "danger",
        "Add Promo Code",
        "Invalid discount amount"
      );
    }
    // data is valid
    axios
      .post("/api/newPromoCode", {
        codeName: this.state.codeName,
        purpose: this.state.purpose,
        discAmt: this.state.discAmt,
        restricted: restricted
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Added new promocode!",
            codeName: "",
            purpose: "",
            discAmt: "",
            restricted: "false"
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
          <h4>Add Promo Code</h4>
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
                  placeholder="promocode name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Disc. Amnt</label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.discAmt}
                  onChange={this.handleDiscAmtChange}
                  placeholder="discount amount"
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
              <label className="control-label col-md-4">Restrict Code</label>
              <div className="col-md-8 radio-group  ">
                <div className="radio-input-group">
                  <input
                    id="restrictYes"
                    name="restrictCode"
                    value="true"
                    checked={this.state.restricted === "true"}
                    onChange={this.handleRestrictChange}
                    type="radio"
                  />
                  <label for="restrictYes">Yes</label>
                </div>
                <div className="radio-input-group">
                  <input
                    id="restrictNo"
                    name="restrictCode"
                    type="radio"
                    value="false"
                    checked={this.state.restricted === "false"}
                    onChange={this.handleRestrictChange}
                  />
                  <label for="restrictNo">No</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-3"></label>
              <div className="col-md-9">
                <button
                  type="button"
                  onClick={this.handleSubmit}
                  className="right btn btn-fill btn-info"
                >
                  Add Code
                </button>
              </div>
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
          </form>
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

export default AddPromoCode;
