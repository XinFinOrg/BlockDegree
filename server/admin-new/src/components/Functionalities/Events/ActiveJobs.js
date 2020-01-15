import React, { Component } from "react";
import Alert from "sweetalert-react";
import axios from "axios";

class ActiveJobs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      confirmMsg: "Are you sure you want to delete this Event?",
      showConfirm: false
    };
    this.renderCard = this.renderCard.bind(this);
    this.fetchActiveJobs = this.fetchActiveJobs.bind(this);
    this.removePost = this.removePost.bind(this);
  }

  fetchActiveJobs() {
    console.log("called fetchActiveJobs");
    axios
      .get("/api/getCurrentEventJobs")
      .then(resp => {
        console.log("Response from fetchActiveJobs: ", resp);
        if (resp.data.status === true) {
          // allGood, set state
          this.setState({ jobs: resp.data.jobs });
        } else {
          // display error
        }
      })
      .catch(e => {
        console.log("error while fetching resp: ", e);
      });
  }

  removePost(eventId, derivedFrom) {
    console.log("called remove event");
    axios
      .post("/api/removePost", { eventId: eventId, derivedFrom: derivedFrom })
      .then(resp => {
        console.log("repsonse in removePost: ", resp);
        if (resp.data.status === true) {
          this.setState({
            showSuccess: true,
            successMsg: "Removed Event!",
            currEvent: null
          });
        } else {
          this.setState({
            showError: true,
            errorMsg: resp.data.error
          });
        }
      })
      .catch(e => {
        console.log("exception at removePost func");
        this.setState({
          showError: true,
          errorMsg: e
        });
      });
  }

  componentWillMount() {
    this.fetchActiveJobs();
  }

  renderCard(item) {
    return (
      <div className="active-job-card">
        <div className="job-content">
          <div className="active-job-title">{item.eventName}</div>
          <div className="active-job-desc">
            <div className="active-job-purpose">{item.eventPurpose}</div>
            <div className="active-job-next-invocation">
              <span className="active-job-ts">Next Post:</span>
              <span className="active-job-val">
                {item.nextInvocation !== null &&
                item.nextInvocation !== undefined
                  ? ` ${new Date(item.nextInvocation).getHours()}:${new Date(
                      item.nextInvocation
                    ).getMinutes()} , ${new Date(
                      item.nextInvocation
                    ).getDate()}/${new Date(item.nextInvocation).getMonth() +
                      1}/${new Date(item.nextInvocation).getFullYear()}`
                  : `${item.stateVarName}`}
              </span>
            </div>

            <div className="active-job-recurr">
              Type:
              {item.recurring ? (
                <div className="recurr-yes">recurring</div>
              ) : (
                <div className="recurr-no">one-time</div>
              )}
            </div>
            <div className="active-job-id">
              {item.eventId === "" ? (
                <div>
                  <span>Derived From:</span>
                  <span> {item.derivedFrom}</span>
                </div>
              ) : (
                <div>
                  <span>Event-ID:</span>
                  <span> {item.eventId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="job-cancel"
          onClick={() => {
            this.removePost(
              item.eventId,
              item.derivedFrom === "" ||
                item.derivedFrom === null ||
                item.derivedFrom === undefined
                ? null
                : item.derivedFrom
            );
          }}
        >
          <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="card ">
        <div className="header">
          <h4>
            Active Jobs{" "}
            <span
              onClick={() => {
                this.fetchActiveJobs();
              }}
              className="table-refresh-btn right"
            >
              <i class="fa fa-refresh" aria-hidden="true"></i>
            </span>
          </h4>
        </div>
        <div className="content active-job-container">
          {this.state.jobs.length === 0
            ? "No Active Jobs"
            : this.state.jobs.map(item => {
                return this.renderCard(item);
              })}
        </div>

        <Alert
          title="Confirm"
          show={this.state.showConfirm}
          text={this.state.confirmMsg}
          type="warning"
          showCancelButton="true"
          onCancel={() => this.setState({ showConfirm: false })}
          onConfirm={() => {
            // this.setState({ showConfirm: false });
            this.removePost();
          }}
        />

        <Alert
          title="Success"
          show={this.state.showSuccess}
          text={this.state.successMsg}
          type="success"
          onConfirm={() => {
            this.fetchActiveJobs();
            this.setState({ showSuccess: false, successMsg: "success" });
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

export default ActiveJobs;
