import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";
import { store } from "react-notifications-component";
import validate from "../validate";

const initialState = {
  fundId: "",
  all: false,
};

class SendTokensToAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
    this.handleAllChange = this.handleAllChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleAllChange(e) {
    this.setState({ all: e.target.value === "true" });
  }

  handleSubmit() {
    console.log("called handle submit");
    axios({
      method: "post",
      url: "/api/transferFMDFundToAdmin",
      data: {
        fundId: this.state.fundId,
        all: this.state.all,
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
          <h4>Send Tokens TO Admin</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Send From All</label>
              <div className="col-md-8 radio-group  ">
                <div className="radio-input-group">
                  <input
                    id="sendAllYes"
                    name="restrictCode"
                    value="true"
                    checked={this.state.all === true}
                    onChange={this.handleAllChange}
                    type="radio"
                  />
                  <label for="sendAllYes">Yes</label>
                </div>
                <div className="radio-input-group">
                  <input
                    id="sendAllNo"
                    name="restrictCode"
                    type="radio"
                    value="false"
                    checked={this.state.all === false}
                    onChange={this.handleAllChange}
                  />
                  <label for="sendAllNo">No</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Fund ID</label>
              <div className="col-md-8">
                {this.state.all === true ? (
                  <input
                    value={this.state.fundId}
                    onChange={(e) => this.setState({ fundId: e.target.value })}
                    placeholder="Enter Fund ID"
                    disabled
                  />
                ) : (
                  <input
                    value={this.state.fundId}
                    onChange={(e) => this.setState({ fundId: e.target.value })}
                    placeholder="Enter Fund ID"
                  />
                )}
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

export default SendTokensToAdmin;
