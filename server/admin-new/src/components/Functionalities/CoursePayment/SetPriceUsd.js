import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";
class SetPriceUsd extends Component {
  constructor(props) {
    super(props);
    this.state = { courseId: "", price: "" };

    this.handleCourseIdChange = this.handleCourseIdChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleCourseIdChange(event) {
    this.setState({ courseId: event.target.value });
  }

  handlePriceChange(event) {
    this.setState({ price: event.target.value });
  }

  handleSubmit() {
    const courseIdValid = validate("code", this.state.courseId);
    const priceValid = validate("float", this.state.price);

    if (!courseIdValid) {
      return showNotification("danger", "Set Price", "Invalid course id");
    }

    if (!priceValid) {
      return showNotification("danger", "Set Price", "Invalid price");
    }

    // data is valid
    axios
      .post("/api/setPriceUsd", {
        courseId: this.state.courseId.toString(),
        priceUsd: this.state.price.toString()
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Price Set!",
            courseId: "",
            price: ""
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
          <h4>Set Course Price</h4>
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
              <label className="col-md-4 control-label">Price ( $ )</label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.price}
                  onChange={this.handlePriceChange}
                  placeholder="price in $"
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
                  Set
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

export default SetPriceUsd;
