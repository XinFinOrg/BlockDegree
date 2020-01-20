import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import validate from "../validate";

import { store } from "react-notifications-component";

class CancelPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventId: ""
    };

    this.handleEventIdChange = this.handleEventIdChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEventIdChange(event) {
    this.setState({ eventId: event.target.value });
  }

  handleSubmit() {
    const validEventId = validate("text", this.state.eventId);
    if (validEventId !== true) {
      return showNotification("danger", "Cancel Event", "Invalid event id");
    }
    axios
      .post("/api/cancelEvent", { eventId: this.state.eventId })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          this.setState({
            showSuccess: true,
            successMsg: "Event Cancelled",
            eventId: ""
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

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Cancel Post</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-3">Event ID</label>
              <div className="col-md-9">
                <input
                  type="text"
                  placeholder="please enter an event id"
                  onChange={this.handleEventIdChange}
                  value={this.state.eventId}
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
          onConfirm={() => {
            this.setState({ showSuccess: false, successMsg: "success" });
            this.props.fetchActiveJobs();
          }}
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

export default CancelPost;
