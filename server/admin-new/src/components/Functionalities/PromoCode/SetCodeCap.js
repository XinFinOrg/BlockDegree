import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class SetCodeCap extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "", setCap: "false", codeName: "" };

    this.handleCodeNameChange = this.handleCodeNameChange.bind(this);
    this.handleSetCapChange = this.handleSetCapChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCodeNameChange(event) {
    this.setState({ codeName: event.target.value });
  }

  handleSetCapChange(event) {
    this.setState({ setCap: event.target.value });
  }

  handleSubmit() {
    const codeNameValid = validate("code", this.state.codeName);
    if (!codeNameValid) {
      return showNotification("danger", "Set Code Cap", "Invalid code name");
    }

    // data is valid
    axios
      .post("/api/setPromoCodeCap", {
        codeName: this.state.codeName,
        setCap: this.state.setCap
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
            setCap: "false"
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
          <h4>Set Promo Code Cap</h4>
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
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-3">Set Cap</label>
              <div className="col-md-9 radio-group  ">
                <div className="radio-input-group">
                  <input
                    id="setCapYes"
                    value="true"
                    checked={this.state.setCap === "true"}
                    onChange={this.handleSetCapChange}
                    name="setCap"
                    type="radio"
                  />
                  <label for="setCapYes">Yes</label>
                </div>
                <div className="radio-input-group">
                  <input
                    id="setCapNo"
                    name="setCap"
                    value="false"
                    checked={this.state.setCap === "false"}
                    onChange={this.handleSetCapChange}
                    type="radio"
                  />
                  <label for="setCapNo">No</label>
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
                  Set Cap
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

export default SetCodeCap;
