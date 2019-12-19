import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class SetCapLimit extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "", codeName: "", useLimit: 0 };

    this.handleCodeNameChange = this.handleCodeNameChange.bind(this);
    // handleUseLimitChange
    this.handleUseLimitChange = this.handleUseLimitChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCodeNameChange(event) {
    this.setState({ codeName: event.target.value });
  }

  handleUseLimitChange(event) {
    this.setState({ useLimit: event.target.value });
  }

  handleSubmit() {
    const codeNameValid = validate("code", this.state.codeName);
    const limitValid = validate("integer",this.state.useLimit);
    if (!codeNameValid) {
      return showNotification("danger", "Set Cap Limit", "Invalid code name");
    }

    if (!limitValid){
      return showNotification("danger", "Set Cap Limit", "Invalid limit number");
    }

    // data is valid
    axios
      .post("/api/setPromoCodeUseLimit", {
        codeName: this.state.codeName,
        useLimit: this.state.useLimit
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Code Cap set!",
            codeName: "",
            useLimit: 0
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
          <h4>Cap Limit</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-3 control-label">Code name</label>
              <div className="col-md-9">
                <input
                  type="text"
                  value={this.state.codeName}
                  onChange={this.handleCodeNameChange}
                  placeholder="promocode name"
                />{" "}
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-3 control-label">cap limit</label>
              <div className="col-md-9">
                <input
                  type="number"
                  value={this.state.useLimit}
                  onChange={this.handleUseLimitChange}
                  placeholder="cap limit"
                />
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
                  Set Limit
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

export default SetCapLimit;
