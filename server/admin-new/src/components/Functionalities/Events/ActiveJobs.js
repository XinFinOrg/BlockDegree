import React, { Component } from "react";
import Alert from "sweetalert-react";
import axios from "axios";

class ActiveJobs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      confirmMsg: "Are you sure you want to delete this Event?",
      showConfim: false
    };
    this.renderCard = this.renderCard.bind(this);
    this.fetchActiveJobs = this.fetchActiveJobs.bind(this);
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
              <span className="active-job-ts">TS:</span>
              <span className="active-job-val">
                {new Date(item.nextInvocation).getHours() +
                  ":" +
                  new Date(item.nextInvocation).getMinutes()}
                ,
                {new Date(item.nextInvocation).getDate() +
                  "/" +
                  (new Date(item.nextInvocation).getMonth() + 1) +
                  "/" +
                  new Date(item.nextInvocation).getFullYear()}{" "}
              </span>
            </div>

            <div className="active-job-recurr">test</div>
            <div className="active-job-id">Event-ID: {item.eventId}</div>
          </div>
        </div>
        <div
          className="job-cancel"
          onClick={() => {
            this.setState({ showConfim: true });
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
          {this.state.jobs.map(item => {
            return this.renderCard(item);
          })}
        </div>

        <Alert
          title="Confirm"
          show={this.state.showConfim}
          text={this.state.confirmMsg}
          type="warning"
          onConfirm={() => this.setState({ showConfim: false })}
        />
      </div>
    );
  }
}

export default ActiveJobs;
