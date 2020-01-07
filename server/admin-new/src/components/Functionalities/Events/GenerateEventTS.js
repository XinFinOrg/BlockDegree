import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import { SingleDatePicker } from "react-dates"; //not to be used
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import moment from "moment";
import FormData from "form-data";

import "react-datepicker/dist/react-datepicker.css";

import "react-dropdown/style.css";

import Select from "react-select";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";
import "rc-time-picker/assets/index.css";
import { templates } from "handlebars";

const options = [
  { value: "annually", label: "Annually" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" }
];

const eventTypesOpts = [
  { label: "Certificates", value: "certificates" },
  { label: "Registrations", value: "registrations" },
  { label: "Course Visits", value: "visits" },
  { label: "One Time", value: "one-time" }
];

const monthlyDay = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "11" },
  { value: 12, label: "12" },
  { value: 13, label: "13" },
  { value: 14, label: "14" },
  { value: 15, label: "15" },
  { value: 16, label: "16" },
  { value: 17, label: "17" },
  { value: 18, label: "18" },
  { value: 19, label: "19" },
  { value: 20, label: "20" },
  { value: 21, label: "21" },
  { value: 22, label: "22" },
  { value: 23, label: "23" },
  { value: 24, label: "24" },
  { value: 25, label: "25" },
  { value: 26, label: "26" },
  { value: 27, label: "27" },
  { value: 28, label: "28" },
  { value: 29, label: "29" },
  { value: 30, label: "30" },
  { value: 31, label: "31" }
];

const weeklyDay = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" }
];

class GenerateEventTS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: "",
      eventPurpose: "",
      eventType: null,
      eventDate: moment(),
      eventTime: moment(),
      postDate: "",
      postTime: "",
      useCustomFile: "false",
      inputFile: "",
      postStatus: "",
      postAll: false,
      isRecurring: "false",
      recurrCyclePeriod: null,
      recurrEventDateAnnual: moment(),
      recurrEventTimeAnnual: moment(),
      recurrCycleMonthly: null,
      recurrCycleWeekly: null,
      recurrEventTimeWeekly: moment(),
      recurrEventTimeMonthly: moment(),
      templatesOpts: [],
      selectedTemplate: null
    };

    this.handleEventTypeChange = this.handleEventTypeChange.bind(this);
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
    this.handlePostStatusChange = this.handlePostStatusChange.bind(this); // handleRecurrToggle
    this.handleRecurrToggle = this.handleRecurrToggle.bind(this);
    this.handleRecurrCycleChange = this.handleRecurrCycleChange.bind(this);
    this.renderRecurringInput = this.renderRecurringInput.bind(this);
    this.handleRecurrCycleDateChange = this.handleRecurrCycleDateChange.bind(
      this
    );
    this.handleRecurrCycleDayChange = this.handleRecurrCycleDayChange.bind(
      this
    );
    this.generateTemplateOpts = this.generateTemplateOpts.bind(this);
    this.handlePostTemplateChange = this.handlePostTemplateChange.bind(this);
    this.fileInput = React.createRef();
  }

  handlePostTemplateChange(option) {
    this.setState({ selectedTemplate: option });
  }

  generateTemplateOpts() {
    console.log("postTemplates: ", this.props.postTemplates);
    if (this.props.postTemplates !== undefined) {
      const opts = [];
      this.props.postTemplates.forEach(template => {
        opts.push({
          label: template.templateName,
          value: template.id
        });
      });
      console.log("opts: ", opts);
      return opts;
    }
    return [];
  }

  handleEventTypeChange(option) {
    console.log("called handle event type change");
    this.setState({ eventType: option });
  }

  renderRecurringInput() {
    if (this.state.recurrCyclePeriod === null) {
      return "";
    }
    switch (this.state.recurrCyclePeriod.value) {
      case "annually": {
        return (
          <div className="form-group">
            <label className="control-label col-md-4">Recurring Annually</label>
            {/* <div className="col-md-4"></div> */}

            <div className="col-md-8 pad-20">
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-11">
                  <DatePicker
                    popperPlacement="top-start"
                    selected={this.state.recurrEventDateAnnual}
                    onChange={recurrEventDateAnnual =>
                      this.setState({ recurrEventDateAnnual })
                    }
                    minDate={new Date()}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-11">
                  <TimePicker
                    showSecond={false}
                    defaultValue={moment()}
                    value={this.state.recurrEventTimeAnnual}
                    className="xxx"
                    onChange={recurrEventTimeAnnual => {
                      this.setState({ recurrEventTimeAnnual });
                    }}
                    format={"h:mm a"}
                    use12Hours
                    inputReadOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }
      case "monthly": {
        return (
          <div className="form-group recur-weekly">
            <label className="control-label col-md-4 ">Recurring Monthly</label>
            {/* <div className="col-md-4"></div> */}
            <div className="col-md-8 pad-20">
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-11 select-up">
                  <Select
                    value={this.state.recurrCycleMonthly}
                    onChange={this.handleRecurrCycleDateChange}
                    options={monthlyDay}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-11">
                  <TimePicker
                    showSecond={false}
                    defaultValue={moment()}
                    value={this.state.recurrEventTimeMonthly}
                    className="xxx"
                    onChange={recurrEventTimeMonthly => {
                      this.setState({ recurrEventTimeMonthly });
                    }}
                    format={"h:mm a"}
                    use12Hours
                    inputReadOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }
      case "weekly": {
        return (
          <div className="form-group recur-weekly">
            <label className="control-label col-md-4">Recurring Weekly</label>
            {/* <div className="col-md-4"></div> */}
            <div className="col-md-8 pad-20">
              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-11">
                  <Select
                    value={this.state.recurrCycleWeekly}
                    onChange={this.handleRecurrCycleDayChange}
                    options={weeklyDay}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-11">
                  <TimePicker
                    showSecond={false}
                    defaultValue={moment()}
                    value={this.state.recurrEventTimeWeekly}
                    className="xxx"
                    onChange={recurrEventTimeWeekly => {
                      this.setState({ recurrEventTimeWeekly });
                    }}
                    format={"h:mm a"}
                    use12Hours
                    inputReadOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }
      default: {
        return;
      }
    }
  }

  handleRecurrToggle(event) {
    console.log("called handleRecurrToggle -> ", this.state.isRecurring);
    this.setState({ isRecurring: event.target.value });
    if (event.target.value === "true")
      document
        .getElementById("gen-evnt-btn-ts")
        .scrollIntoView({ behavior: "smooth", block: "end" });
  }

  handleRecurrCycleChange(option) {
    console.log("RecurrCycleChange called; option:", option);
    this.setState({ recurrCyclePeriod: option });
    document
      .getElementById("gen-evnt-btn-ts")
      .scrollIntoView({ behavior: "smooth", block: "end" });
  }

  handleRecurrCycleDateChange(option) {
    console.log("RecurrCycleDateChange called; option:", option);
    this.setState({ recurrCycleMonthly: option });
  }

  handleRecurrCycleDayChange(option) {
    console.log("RecurrCycleDayChange called; option:", option);
    this.setState({ recurrCycleWeekly: option });
  }

  handleFileReset() {
    this.setState({ inputFile: "" });
    console.log(
      "called handleFileReset: ",
      document.getElementById("customFileInput")
    );
    if (
      document.getElementById("customFileInput") !== undefined &&
      document.getElementById("customFileInput") !== null
    )
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
    const eventNameValid = validate("text", this.state.eventName);
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

    if (this.state.eventType === null) {
      showNotification(
        "danger",
        "Generate Event By Timestamp",
        "Please select the event type"
      );
      return;
    }

    if (this.state.useCustomFile === "true") {
      if (this.state.inputFile === "") {
        showNotification(
          "danger",
          "Generate Event By Timestamp",
          "Please upload post template"
        );
        return;
      }
    } else if (this.state.useCustomFile === "false") {
      if (this.state.selectedTemplate === null) {
        showNotification(
          "danger",
          "Generate Event By Timestamp",
          "Please select post template"
        );
        return;
      }
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

    if (this.state.isRecurring === "true") {
      // isRecurring, check if appropriate inputs are provided
      switch (this.state.recurrCyclePeriod.value) {
        case "annually": {
          if (this.state.recurrEventDateAnnual === null) {
            console.error("annually recurring date is null");
            return showNotification(
              "danger",
              "Generate Event By Timestamp",
              "Please select annually recurring date!"
            );
          }
          if (this.state.recurrEventTimeAnnual === null) {
            console.error("annually recurring time is null");
            return showNotification(
              "danger",
              "Generate Event By Timestamp",
              "Please select annually recurring time!"
            );
          }
          break;
        }
        case "monthly": {
          if (this.state.recurrCycleMonthly === null) {
            console.error("monthly recurring cycle period is null");
            return showNotification(
              "danger",
              "Generate Event By Timestamp",
              "Please select monthly recurring date!"
            );
          }
          if (this.state.recurrEventTimeMonthly === null) {
            console.error("monthly recurring cycle period time is null");
            return showNotification(
              "danger",
              "Generate Event By Timestamp",
              "Please select monthly recurring time!"
            );
          }
          break;
        }
        case "weekly": {
          // recurrCycleWeekly
          if (this.state.recurrCycleWeekly === null) {
            console.error("weekly recurring cycle period is null");
            return showNotification(
              "danger",
              "Generate Event By Timestamp",
              "Please select recurring cycle period day!"
            );
          }
          if (this.state.recurrEventTimeWeekly === null) {
            console.error("weekly recurring cycle period time is null");
            return showNotification(
              "danger",
              "Generate Event By Timestamp",
              "Please select recurring cycle period time!"
            );
          }
          break;
        }
        default: {
          return;
        }
      }
    }

    const form = new FormData();
    form.append("eventName", this.state.eventName);
    form.append("eventPurpose", this.state.eventPurpose);
    form.append("eventTS", eventDayDate);
    form.append("eventType", this.state.eventType.value);
    form.append("file", this.state.inputFile);
    form.append("socialPlatform", JSON.stringify(socialPlatform));
    form.append("useCustom", this.state.useCustomFile);
    form.append(
      "templateId",
      this.state.selectedTemplate === null
        ? ""
        : this.state.selectedTemplate.value
    );
    form.append("postStatus", this.state.postStatus);
    form.append("isRecurring", this.state.isRecurring);
    form.append(
      "recurrCyclePeriod",
      JSON.stringify(this.state.recurrCyclePeriod)
    );
    form.append("recurrEventDateAnnual", this.state.recurrEventDateAnnual);
    form.append("recurrEventTimeAnnual", this.state.recurrEventTimeAnnual);
    form.append(
      "recurrCycleMonthly",
      JSON.stringify(this.state.recurrCycleMonthly)
    );
    form.append("recurrEventTimeMonthly", this.state.recurrEventTimeMonthly);
    form.append(
      "recurrCycleWeekly",
      JSON.stringify(this.state.recurrCycleWeekly)
    );
    form.append("recurrEventTimeWeekly", this.state.recurrEventTimeWeekly);

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
          if (
            document.getElementById("customFileInput") !== undefined &&
            document.getElementById("customFileInput") !== null
          ) {
            document.getElementById("customFileInput").disabled = true;
          }
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
            postStatus: "",
            postOnFacebook: false,
            postOnLinkedin: false,
            postOnTwitter: false,
            postOnTelegram: false,
            postAll: false,
            recurrEventDateAnnual: moment(),
            recurrEventTimeAnnual: moment(),
            recurrCycleMonthly: null,
            recurrCycleWeekly: null,
            selectedTemplate: null,
            eventType: null,
            recurrCyclePeriod: null
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
              <label className="control-label col-md-4">
                Is Event Recurring
              </label>
              <div className="col-md-8 radio-group  ">
                <div className="radio-input-group no-delay">
                  <input
                    id="recurrYes"
                    name="recurrEvent"
                    value="true"
                    checked={this.state.isRecurring === "true"}
                    onChange={this.handleRecurrToggle}
                    type="radio"
                  />
                  <label for="recurrYes">Yes</label>
                </div>
                <div className="radio-input-group no-delay">
                  <input
                    id="recurrNo"
                    name="recurrEvent"
                    type="radio"
                    value="false"
                    checked={this.state.isRecurring === "false"}
                    onChange={this.handleRecurrToggle}
                  />
                  <label for="recurrNo">No</label>
                </div>
              </div>
            </div>

            {this.state.isRecurring === "true" ? (
              <div>
                <div className="form-group">
                  <label className="control-label col-md-4">
                    Recurring Cycle
                  </label>
                  <div className="col-md-4"></div>
                  <div className="col-md-8">
                    <div className="col-md-10">
                      <Select
                        value={this.state.recurrCyclePeriod}
                        onChange={this.handleRecurrCycleChange}
                        options={options}
                      />
                    </div>
                    <div className="col-md-2">
                      {/* <i class="fa fa-plus add-btn" aria-hidden="true"></i> */}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="control-label col-md-4">
                    Select Template
                  </label>
                  <div className="col-md-8">
                    <Select
                      value={this.state.selectedTemplate}
                      onChange={this.handlePostTemplateChange}
                      options={this.generateTemplateOpts()}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="control-label col-md-4">
                    Scheduled Date
                  </label>
                  <div className="control-label col-md-4">
                    <SingleDatePicker
                      date={this.state.eventDate}
                      onDateChange={eventDate => this.setState({ eventDate })}
                      focused={this.state.focused}
                      onFocusChange={({ focused }) =>
                        this.setState({ focused })
                      }
                      minDate={moment()}
                      numberOfMonths={1}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="control-label col-md-4">
                    Scheduled Time
                  </label>
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
                  <label className="control-label col-md-4">
                    Use Custom File
                  </label>
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

                {this.state.useCustomFile === "true" ? (
                  <div className="form-group">
                    <label className="control-label col-md-4">
                      Custom File
                    </label>
                    <div className="control-label col-md-4">
                      <input
                        type="file"
                        name="customFile"
                        onChange={this.customFileInputChange}
                        id="customFileInput"
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
                ) : (
                  <div className="form-group">
                    <label className="control-label col-md-4">
                      Select Template
                    </label>
                    <div className="col-md-8">
                      <Select
                        value={this.state.selectedTemplate}
                        onChange={this.handlePostTemplateChange}
                        options={this.generateTemplateOpts()}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {this.state.isRecurring === "true" &&
            this.state.recurrCyclePeriod !== null
              ? this.renderRecurringInput()
              : ""}

            <div className="form-group">
              <label className="col-md-3"></label>
              <div className="col-md-9">
                <button
                  id="gen-evnt-btn-ts"
                  type="button"
                  onClick={this.handleSubmit}
                  className="right btn btn-fill btn-info"
                >
                  Generate Event
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
