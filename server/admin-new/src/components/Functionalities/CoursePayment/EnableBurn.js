import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";
class EnableBurn extends Component {
  constructor(props) {
    super(props);
    this.state = { courseId: "", tokenName: "" };

    this.handleCourseIdChange = this.handleCourseIdChange.bind(this);
    this.handleTokenNameChange = this.handleTokenNameChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCourseIdChange(event) {
    this.setState({ courseId: event.target.value });
  }

  handleTokenNameChange(event) {
    this.setState({ tokenName: event.target.value });
  }

  handleSubmit() {
    const courseIdValid = validate("code", this.state.courseId);
    const tokenNameValid = validate("text", this.state.tokenName);

    if (!courseIdValid) {
      return showNotification("danger", "Add Course", "Invalid course id");
    }

    if (!tokenNameValid) {
      return showNotification("danger", "Add Course", "Invalid token name");
    }

    // data is valid
    axios
      .post("/api/enableBurning", {
        courseId: this.state.courseId.toString(),
        tokenName: this.state.tokenName.toString()
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Enabled Burn!",
            courseId: "",
            tokenName: ""
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
          <h4>Enable Burn</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Course ID</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.courseId}
                  onChange={this.handleCourseIdChange}
                  placeholder="course id"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Token Name</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.tokenName}
                  onChange={this.handleTokenNameChange}
                  placeholder="token name"
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
                  Enable
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

export default EnableBurn;
