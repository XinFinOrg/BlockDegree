import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import { SingleDatePicker } from "react-dates";
import TimePicker from "rc-time-picker";
import moment from "moment";
import FormData from "form-data";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";
import "rc-time-picker/assets/index.css";

class GenerateEventTS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: "",
      eventPurpose: "",
      eventDate: moment(),
      eventTime: moment(),
      postDate: "",
      postTime: "",
      useCustomFile: "false",
      inputFile: "",
      postStatus: "",
      postAll: false
    };

    this.handlePostFacebookChange = this.handlePostFacebookChange.bind(this);
    this.handlePostTwitterChange = this.handlePostTwitterChange.bind(this);
    this.handlePostTelegramChange = this.handlePostTelegramChange.bind(this);
    this.handlePostLinkedinChange = this.handlePostLinkedinChange.bind(this);
    this.handlePostTimeChange = this.handlePostTimeChange.bind(this);
    this.handlePostDateChange = this.handlePostDateChange.bind(this); // handlePostAllChange
    this.handlePostAllChange = this.handlePostAllChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUseCustomChange = this.handleUseCustomChange.bind(this);
    this.handleEventPurposeChange = this.handleEventPurposeChange.bind(this);
    this.handleEventNameChange = this.handleEventNameChange.bind(this); // customFileInputChange
    this.customFileInputChange = this.customFileInputChange.bind(this); // handleFileReset
    this.handleFileReset = this.handleFileReset.bind(this);
    this.handlePostStatusChange = this.handlePostStatusChange.bind(this);
    this.fileInput = React.createRef();
  }

  handleFileReset() {
    this.setState({ inputFile: null });
    document.getElementById("customFileInput").value = "";
  }

  handlePostStatusChange(event) {
    this.setState({ postStatus: event.target.value });
  }

  customFileInputChange(event) {
    this.setState({ inputFile: event.target.files[0] });
  }

  handleEventNameChange(event) {
    this.setState({ eventName: event.target.value });
  }

  handleEventPurposeChange(event) {
    this.setState({ eventPurpose: event.target.value });
  }

  handleUseCustomChange(event) {
    const customFileInput = document.getElementById("customFileInput");
    if (event.target.value === "true") {
      customFileInput.disabled = false;
    } else if (event.target.value === "false") {
      customFileInput.disabled = true;
    }
    this.setState({ useCustomFile: event.target.value });
  }

  handlePostFacebookChange(event) {
    this.setState({ postOnFacebook: event.target.checked });
  }

  handlePostTwitterChange(event) {
    this.setState({ postOnTwitter: event.target.checked });
  }

  handlePostTelegramChange(event) {
    this.setState({ postOnTelegram: event.target.checked });
  }

  handlePostLinkedinChange(event) {
    this.setState({ postOnLinkedin: event.target.checked });
  }

  handlePostAllChange(event) {
    console.log("Post on all checked: ", event.target.value);
    if (event.target.checked) {
      this.setState({
        postOnFacebook: true,
        postOnLinkedin: true,
        postOnTwitter: true,
        postOnTelegram: true,
        postAll: true
      });
    } else {
      this.setState({
        postOnFacebook: false,
        postOnLinkedin: false,
        postOnTwitter: false,
        postOnTelegram: false,
        postAll: false
      });
    }
  }

  handlePostDateChange(event) {
    this.setState({ postDate: event.target.date });
  }

  handlePostTimeChange(event) {
    this.setState({ postTime: event.target.value });
  }

  // type, title, message
  handleSubmit() {
    const eventNameValid = validate("code", this.state.eventName);
    const eventPurposeValid = validate("text", this.state.eventPurpose);
    const postStatus = validate("text", this.state.postStatus);

    if (!eventNameValid) {
      return showNotification(
        "danger",
        "Generate Event By Timestamp",
        "Invalid Event Name"
      );
    }
    if (!eventPurposeValid) {
      return showNotification(
        "danger",
        "Generate Event By Timestamp",
        "Invalid Event Purpose"
      );
    }
    if (!postStatus) {
      return showNotification(
        "danger",
        "Generate Event By Timestamp",
        "Invalid Post Status"
      );
    }

    const eventDayDate = this.state.eventDate.toDate();
    const eventDayTime = this.state.eventTime.toDate();

    eventDayDate.setHours(
      eventDayTime.getHours(),
      eventDayTime.getMinutes(),
      0,
      0
    );

    const socialPlatform = {
      facebook: this.state.postOnFacebook,
      twitter: this.state.postOnTwitter,
      linkedin: this.state.postOnLinkedin,
      telegram: this.state.postOnTelegram
    };

    if (
      !this.state.postOnFacebook &&
      !this.state.postOnLinkedin &&
      !this.state.postOnTelegram &&
      !this.state.postOnTwitter
    ) {
      return showNotification(
        "danger",
        "Generate Event By Timestamp",
        "Please select atleast one platform!"
      );
    }

    const form = new FormData();
    form.append("eventName", this.state.eventName);
    form.append("eventPurpose", this.state.eventPurpose);
    form.append("eventTS", eventDayDate);
    form.append("file", this.state.inputFile);
    form.append("socialPlatform", JSON.stringify(socialPlatform));
    form.append("useCustom", this.state.useCustomFile);
    form.append("postStatus", this.state.postStatus);
    // return;
    // data is valid
    axios
      .post("/api/scheduleEventByTime", form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          document.getElementById("customFileInput").disabled = true;
          this.setState({
            showSuccess: true,
            successMsg: "New Event Generated!",
            eventName: "",
            eventPurpose: "",
            eventDate: moment(),
            eventTime: moment(),
            postDate: "",
            postTime: "",
            useCustomFile: "false",
            inputFile: "",
            postStatus:"",
            postOnFacebook: false,
            postOnLinkedin: false,
            postOnTwitter: false,
            postOnTelegram: false,
            postAll: false
          });
          this.handleFileReset();
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
        console.log(err);
        this.setState({
          showError: true,
          errorMsg: err
        });
      });
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Generate Event By Timestamp</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Event Name</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.eventName}
                  placeholder="event name"
                  onChange={this.handleEventNameChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Event Purpose</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.eventPurpose}
                  placeholder="event purpose"
                  onChange={this.handleEventPurposeChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Post Status</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.postStatus}
                  placeholder="post status"
                  onChange={this.handlePostStatusChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Choose</label>

              <div className="col-md-8 checkbox-grp">
                <div className="row">
                  <div className="col-md-6">
                    <label>
                      <input
                        type="checkbox"
                        onChange={this.handlePostFacebookChange}
                        checked={this.state.postOnFacebook}
                      />
                      &nbsp;&nbsp; Facebook
                    </label>
                  </div>
                  <div className="col-md-6">
                    <label>
                      <input
                        type="checkbox"
                        onChange={this.handlePostTwitterChange}
                        checked={this.state.postOnTwitter}
                      />
                      &nbsp;&nbsp; Twitter
                    </label>
                  </div>
                  <div className="col-md-6">
                    <label>
                      <input
                        type="checkbox"
                        onChange={this.handlePostTelegramChange}
                        checked={this.state.postOnTelegram}
                      />
                      &nbsp;&nbsp; Telegram
                    </label>
                  </div>
                  <div className="col-md-6">
                    <label>
                      <input
                        type="checkbox"
                        onChange={this.handlePostLinkedinChange}
                        checked={this.state.postOnLinkedin}
                      />
                      &nbsp;&nbsp; Linkedin
                    </label>
                  </div>
                  <div className="col-md-6">
                    <label>
                      <input
                        type="checkbox"
                        onChange={this.handlePostAllChange}
                        checked={this.state.postAll}
                      />
                      &nbsp;&nbsp; All
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Scheduled Date</label>
              <div className="control-label col-md-4">
                <SingleDatePicker
                  date={this.state.eventDate}
                  onDateChange={eventDate => this.setState({ eventDate })}
                  focused={this.state.focused}
                  onFocusChange={({ focused }) => this.setState({ focused })}
                  minDate={moment()}
                  numberOfMonths={1}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Scheduled Time</label>
              <div className="control-label col-md-4">
                <TimePicker
                  showSecond={false}
                  defaultValue={moment()}
                  value={this.state.eventTime}
                  className="xxx"
                  onChange={eventTime => {
                    this.setState({ eventTime });
                  }}
                  format={"h:mm a"}
                  use12Hours
                  inputReadOnly
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Use Custom File</label>
              <div className="col-md-8 radio-group  ">
                <div className="radio-input-group">
                  <input
                    id="customYes"
                    name="restrictCode"
                    value="true"
                    checked={this.state.useCustomFile === "true"}
                    onChange={this.handleUseCustomChange}
                    type="radio"
                  />
                  <label for="customYes">Yes</label>
                </div>
                <div className="radio-input-group">
                  <input
                    id="customNo"
                    name="restrictCode"
                    type="radio"
                    value="false"
                    checked={this.state.useCustomFile === "false"}
                    onChange={this.handleUseCustomChange}
                  />
                  <label for="customNo">No</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Custom File</label>
              <div className="control-label col-md-4">
                <input
                  type="file"
                  name="customFile"
                  onChange={this.customFileInputChange}
                  disabled
                  id="customFileInput"
                  style={{ width: "260px" }}
                />
              </div>
              <div
                style={{ paddingTop: "15px" }}
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
                  type="button"
                  onClick={this.handleSubmit}
                  className="right btn btn-fill btn-info"
                >
                  Generate New Event
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

export default GenerateEventTS;
