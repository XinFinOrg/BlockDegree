import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import { SingleDatePicker } from "react-dates"; //not to be used
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import moment from "moment";
import { store } from "react-notifications-component";
import validate from "../validate";

const initialState = {
  fundId: "",
  timestamp: null,
  eventDate: new Date(),
  eventTime: moment(),
};

class CompletionDateManual extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    console.log("called handle submit");
    const timestamp = this.state.eventDate;
    const eventDayTime = this.state.eventTime.toDate();

    timestamp.setHours(
      eventDayTime.getHours(),
      eventDayTime.getMinutes(),
      0,
      0
    );


    axios({
      method: "post",
      url: "/api/setFMDCompletionDateManual",
      data: {
        fundId: this.state.fundId,
        timestamp: String(timestamp.getTime()),
      },
    })
      .then((resp) => {
        console.log(resp);

        if (resp.data.status === true) {
          this.setState({
            ...initialState,
            successMsg: resp.data.data,
            showSuccess: true,
          });
        } else {
          console.log(resp.data);
          this.setState({ showError: true, errorMsg: resp.data.error });
        }
      })
      .catch((e) => {
        this.setState({ showError: true, errorMsg: "Some error occured" });
      });
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Completion Date Manual</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Fund ID</label>
              <div className="col-md-8  ">
                <input
                  value={this.state.fundId}
                  onChange={(e) => this.setState({ fundId: e.target.value })}
                  placeholder="Enter Fund ID"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Day</label>
              <div className="control-label col-md-4">
                <DatePicker
                  popperPlacement="top-start"
                  selected={this.state.eventDate}
                  onChange={(eventDate) => this.setState({ eventDate })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-md-4">Time</label>
              <div className="control-label col-md-4">
                <TimePicker
                  showSecond={false}
                  defaultValue={moment()}
                  value={this.state.eventTime}
                  className="xxx"
                  onChange={(eventTime) => {
                    this.setState({ eventTime });
                  }}
                  format={"h:mm a"}
                  use12Hours
                  inputReadOnly
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
                  Submit
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

export default CompletionDateManual;
