import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import FormData from "form-data";
import Select from "react-select";
import { store } from "react-notifications-component";

import "react-datepicker/dist/react-datepicker.css";
import "react-dropdown/style.css";
import "rc-time-picker/assets/index.css";

// code, email, integer, float, address, text
import validate from "../validate";

const eventTypesOpts = [
  { label: "Certificates", value: "certificates" },
  { label: "Registrations", value: "registrations" },
  { label: "Course Visits", value: "visits" }
];

class AddPostTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventType: null,
      eventStatus: "",
      inputFile: "",
      inputFileName: ""
    };

    this.handleFileReset = this.handleFileReset.bind(this);
    this.templateFileInputChange = this.templateFileInputChange.bind(this);
    this.handleEventStatusChange = this.handleEventStatusChange.bind(this);
    this.handleEventTypeChange = this.handleEventTypeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFileReset() {
    this.setState({ inputFile: "" });
    document.getElementById("templateFileInput").value = "";
  }

  templateFileInputChange(event) {
    console.log(event.target.files[0]);
    this.setState({
      inputFile: event.target.files[0],
      inputFileName: event.target.value
    });
  }

  handleEventStatusChange(event) {
    console.log("called handle event status change");
    this.setState({ eventStatus: event.target.value });
  }

  handleSubmit() {
    const eventStatusValid = validate("text", this.state.eventStatus);
    if (this.state.eventType === null) {
      showNotification(
        "danger",
        "Add Post Template",
        "Please select a event type"
      );
      return;
    }
    if (!eventStatusValid) {
      console.log("eventStatus is not valid");
      showNotification("danger", "Add Post Template", "Invalid post status");
      return;
    }
    if (this.state.inputFile === "") {
      showNotification("danger", "Add Post Template", "Please select a file");
      return;
    }                                                                                                               
    // if (
    //   this.state.inputFileName.split(".")[
    //     this.state.inputFileName.split(".").length - 1
    //   ] !== "ejs"
    // ) {
    //   showNotification(
    //     "danger",
    //     "Add Post Template",
    //     "Invalid template type, we only accept .ejs"
    //   );
    //   return;                                                                                                                                                                                                                                                                                                                              
    // }
    // all data ok!
    const form = new FormData();
    form.append("eventType", this.state.eventType.value);
    form.append("eventStatus", this.state.eventStatus);
    form.append("file", this.state.inputFile);
    axios
      .post("/api/addPostTemplate", form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          this.setState({
            showSuccess: true,
            successMsg: "New Template Added!",
            eventType: null,
            eventStatus: "",
            inputFile: ""
          });
        } else {
          this.setState({
            showError: true,
            errorMsg: resp.data.error
          });
        }
      })
      .catch(err => {
        console.log("error: ", err);
        this.setState({
          showError: true,
          errorMsg: err
        });
      });
  }

  handleEventTypeChange(option) {
    console.log("called handle event type change");
    this.setState({ eventType: option });
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Add Post Template</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Event Type</label>
              <div className="col-md-8">
                <Select
                  value={this.state.eventType}
                  onChange={this.handleEventTypeChange}
                  options={eventTypesOpts}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Event Status</label>
              <div className="col-md-8">
                <textarea
                  width="100%"
                  type="text"
                  value={this.state.eventStatus}
                  placeholder="event status ( __count__ is the placeholder )"
                  onChange={this.handleEventStatusChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Template File</label>
              <div className="control-label col-md-4">
                <input
                  type="file"
                  name="templateFile"
                  onChange={this.templateFileInputChange}
                  id="templateFileInput"
                  style={{ width: "240px" }}
                />
              </div>
              <div
                style={{ paddingTop: "3%" }}
                onClick={this.handleFileReset}
                className="file-reset-btn"
              >
                <i class="fa fa-times" aria-hidden="true"></i>
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-3"></label>
              <div className="col-md-9">
                <button
                  id="gen-evnt-btn-var"
                  type="button"
                  onClick={this.handleSubmit}
                  className="right btn btn-fill btn-info"
                >
                  Add Post Template
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

export default AddPostTemplate;
