import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      codeName: "",
      userEmail: "",
      errorMsg: "Error",
      successMsg: "Success"
    };

    this.handleCodeNameChange = this.handleCodeNameChange.bind(this);
    this.handleUserEmailChange = this.handleUserEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCodeNameChange(event) {
    this.setState({ codeName: event.target.value });
  }

  handleUserEmailChange(event) {
    this.setState({ userEmail: event.target.value });
  }

  handleSubmit() {
    const codeNameValid = validate("code", this.state.codeName);
    const userEmailValid = validate("email", this.state.userEmail);

    if (!codeNameValid) {
      return showNotification("danger", "Add New User", "Invalid code name");
    }
    if (!userEmailValid) {
      return showNotification("danger", "Add New User", "Invalid email");
    }

    // data is valid
    axios
      .post("/api/addAllowedUser", {
        codeName: this.state.codeName,
        email: this.state.userEmail
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on comfirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Added new user!",
            codeName: "",
            userEmail: ""
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
          <h4>Add User</h4>
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
              <label className="col-md-3 control-label">User Email</label>
              <div className="col-md-9">
                <input
                  type="text"
                  value={this.state.userEmail}
                  onChange={this.handleUserEmailChange}
                  placeholder="user email"
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
                  Add User
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

export default AddUser;
