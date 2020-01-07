import React, { Component } from "react";
import axios from "axios";
import GenerateEventTS from "./GenerateEventTS";
import GenerateEventVar from "./GenerateEventVar";
import AddPostTemplate from "./AddPostTemplate";
import { store } from "react-notifications-component";

class PromoCodeForms extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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
  render() {
    return (
      <div>
        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <GenerateEventTS postTemplates={this.state.postTemplates} />
          </div>
          <div className="col-md-6">
            <GenerateEventVar postTemplates={this.state.postTemplates} />
          </div>
        </div>

        <div className="row" style={{ width: "100%" }}>
          <div className="col-md-6">
            <AddPostTemplate />
          </div>
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

export default PromoCodeForms;
