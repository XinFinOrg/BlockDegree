import React, { Component } from "react";
import axios from "axios";
import GenerateEventTS from "./GenerateEventTS";
import GenerateEventVar from "./GenerateEventVar";
import AddPostTemplate from "./AddPostTemplate";
import EnableAutoPost from "./EnableAutoPost";
import DisableAutoPost from "./DisableAutoPost";
import InitiateConfig from "./InitiateConfig";
import ActiveJobs from "./ActiveJobs";
import ForceSync from "./ForceSync";
import CancelEvent from "./CancelEvent";
import { store } from "react-notifications-component";

class PromoCodeForms extends Component {
  constructor(props) {
    super(props);
    this.state = { jobs: [] };

    this.fetchActiveJobs = this.fetchActiveJobs.bind(this);
  }

  componentDidMount() {
    axios.get("/api/getSocialPostTemplates").then(resp => {
      if (resp.data.status === true) {
        this.setState({ postTemplates: resp.data.templates });
      } else {
        showNotification("danger", "OnMount", "Failed to get PostTemplates");
        return;
      }
    });
  }

  fetchActiveJobs() {
    console.log("called fetch active jobs in parent");
    axios
      .get("/api/getCurrentEventJobs")
      .then(resp => {
        console.log("Response from fetchActiveJobs: ", resp);
        if (resp.data.status === true) {
          // allGood, set state
          this.setState({ jobs: resp.data.jobs });
        } else {
          // display error
          console.log("error while  fetching the jobs: ", resp.data.error);
        }
      })
      .catch(e => {
        console.log("error while fetching resp: ", e);
      });
  }

  render() {
    return (
      <div>
        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <GenerateEventTS
              postTemplates={this.state.postTemplates}
              fetchActiveJobs={this.fetchActiveJobs}
            />
          </div>
          <div className="col-md-6">
            <GenerateEventVar
              postTemplates={this.state.postTemplates}
              fetchActiveJobs={this.fetchActiveJobs}
            />
          </div>
        </div>

        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <AddPostTemplate />
          </div>
          <div className="col-md-6">
            <div className="row">
              <div className="col-md-12">
                <InitiateConfig />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <ForceSync fetchActiveJobs={this.fetchActiveJobs} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <CancelEvent fetchActiveJobs={this.fetchActiveJobs} />
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <ActiveJobs
              jobs={this.state.jobs}
              fetchActiveJobs={this.fetchActiveJobs}
            />
          </div>

          <div className="col-md-6">
            <div className="row">
              <div className="col-md-12">
                <EnableAutoPost />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <DisableAutoPost />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
          </div>
        </div> */}
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

export default PromoCodeForms;
