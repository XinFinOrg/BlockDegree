import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class AddCourse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseName: "",
      courseId: "",
      coursePrice: "",
      xdceTolerance: 0,
      xdcTolerance: 0,
      xdceConfirmations: 0,
      xdcConfirmations: 0
    };

    this.handleCourseIdChange = this.handleCourseIdChange.bind(this);
    this.handleCourseNameChange = this.handleCourseNameChange.bind(this);
    this.handleCoursePriceChange = this.handleCoursePriceChange.bind(this);
    this.handleXdceToleranceChange = this.handleXdceToleranceChange.bind(this);
    this.handleXdcToleranceChange = this.handleXdcToleranceChange.bind(this);
    this.handleXdceConfirmationChange = this.handleXdceConfirmationChange.bind(
      this
    );
    this.handleXdcConfirmationChange = this.handleXdcConfirmationChange.bind(
      this
    );

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleCourseNameChange(event) {
    this.setState({ courseName: event.target.value });
  }

  handleCourseIdChange(event) {
    this.setState({ courseId: event.target.value });
  }

  handleCoursePriceChange(event) {
    this.setState({ coursePrice: event.target.value });
  }

  handleXdceToleranceChange(event) {
    this.setState({ xdceTolerance: event.target.value });
  }

  handleXdcToleranceChange(event) {
    this.setState({ xdcTolerance: event.target.value });
  }

  handleXdceConfirmationChange(event) {
    this.setState({ xdceConfirmations: event.target.value });
  }

  handleXdcConfirmationChange(event) {
    this.setState({ xdcConfirmations: event.target.value });
  }

  handleSubmit() {
    const courseIdValid = validate("code", this.state.courseId);
    const courseNameValid = validate("text", this.state.courseName);
    const coursePriceValid = validate("text", this.state.coursePrice);
    const xdceToleranceValid = validate("float", this.state.xdceTolerance);
    const xdcToleranceValid = validate("float", this.state.xdcTolerance);
    const xdceConfirmations = validate("integer", this.state.xdceConfirmations);
    const xdcConfirmations = validate("float", this.state.xdcConfirmations);

    if (!courseIdValid) {
      return showNotification("danger", "Add Course", "Invalid course id");
    }
    if (!courseNameValid) {
      return showNotification("danger", "Add Course", "Invalid course name");
    }
    if (!xdceToleranceValid) {
      return showNotification("danger", "Add Course", "Invalid xdce tolerance");
    }
    if (!xdcToleranceValid) {
      return showNotification("danger", "Add Course", "Invalid xdc tolerance");
    }
    if (!coursePriceValid) {
      return showNotification("danger", "Add Course", "Invalid course price");
    }
    if (!xdceConfirmations) {
      return showNotification(
        "danger",
        "Add Course",
        "Invalid xdce confirmations"
      );
    }
    if (!xdcConfirmations) {
      return showNotification(
        "danger",
        "Add Course",
        "Invalid xdc confirmations"
      );
    }

    // data is valid
    axios
      .post("/api/addCourse", {
        courseId: this.state.courseId.toString(),
        courseName: this.state.courseName.toString(),
        coursePriceUsd: this.state.coursePrice.toString(),
        xdceTolerance: this.state.xdceTolerance.toString(),
        xdcTolerance: this.state.xdcTolerance.toString(),
        xdceConfirmation: this.state.xdceConfirmations.toString(),
        xdcConfirmation: this.state.xdcConfirmations.toString()
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Added new course!",
            courseId: "",
            courseName: "",
            coursePrice: "",
            xdceTolerance: "",
            xdcTolerance: "",
            xdceConfirmations: "",
            xdcConfirmations: ""
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
          <h4>Add Course</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Code name</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.courseName}
                  onChange={this.handleCourseNameChange}
                  placeholder="course name"
                />
              </div>
            </div>

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
              <label className="col-md-4 control-label">
                Course Price ( $ )
              </label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.coursePrice}
                  onChange={this.handleCoursePriceChange}
                  placeholder="course price $"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">
                XDCe Tolerance ( % )
              </label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.xdceTolerance}
                  onChange={this.handleXdceToleranceChange}
                  placeholder="xdc tolerance ( price fluctuations )"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">
                XDC Tolerance ( % )
              </label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.xdcTolerance}
                  onChange={this.handleXdcToleranceChange}
                  placeholder="xdc tolerance ( price fluctuations )"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">
                XDCe Confirmations <br />( in blocks )
              </label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.xdceConfirmations}
                  onChange={this.handleXdceConfirmationChange}
                  placeholder="xdce Confirmations ( in blocks )"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">
                XDC Confirmations <br />( in blocks )
              </label>
              <div className="col-md-8">
                <input
                  type="number"
                  value={this.state.xdcConfirmations}
                  onChange={this.handleXdcConfirmationChange}
                  placeholder="xdc Confirmations ( in blocks )"
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
                  Add Course
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

export default AddCourse;
