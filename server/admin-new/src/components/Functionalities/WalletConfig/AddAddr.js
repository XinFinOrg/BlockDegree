import React, { Component } from "react";
import axios from "axios";
import Alert from "sweetalert-react";

import { store } from "react-notifications-component";
// code, email, integer, float, address, text
import validate from "../validate";

class AddAddr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletAddr: "",
      walletType: "",
      tokenName: "",
      network: "",
      purpose: ""
    };

    this.handleWalletAddrChange = this.handleWalletAddrChange.bind(this);
    this.handleWalletTypeChange = this.handleWalletTypeChange.bind(this);
    this.handleTokenNameChange = this.handleTokenNameChange.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handlePurposeChange = this.handlePurposeChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleWalletAddrChange(event) {
    this.setState({ walletAddr: event.target.value });
  }

  handleWalletTypeChange(event) {
    this.setState({ walletType: event.target.value });
  }

  handleTokenNameChange(event) {
    this.setState({ tokenName: event.target.value });
  }

  handleNetworkChange(event) {
    this.setState({ network: event.target.value });
  }

  handlePurposeChange(event) {
    this.setState({ purpose: event.target.value });
  }

  handleSubmit() {
    const walletAddressValid = validate("address", this.state.walletAddr);
    const walletTypeValid = validate("test", this.state.walletType);
    const tokenNameValid = validate("text", this.state.tokenName);
    const networkValid = validate("integer", this.state.network);
    const purposeValid = validate("text", this.state.purpose);

    if (!walletAddressValid) {
      return showNotification("danger", "Add Wallet", "Invalid address");
    }

    if (!walletTypeValid) {
      return showNotification("danger", "Add Wallet", "Invalid wallet type");
    }

    if (!tokenNameValid) {
      return showNotification("danger", "Add Wallet", "Invalid token name");
    }

    if (!networkValid) {
      return showNotification("danger", "Add Wallet", "Invalid network");
    }

    if (!purposeValid) {
      return showNotification("danger", "Add Wallet", "Invalid purpose");
    }

    // data is valid
    axios
      .post("/api/addWallet", {
        wallet_address: this.state.walletAddr,
        wallet_token_name: this.state.tokenName,
        wallet_network: this.state.network,
        wallet_purpose: this.state.purpose,
        wallet_type: this.status.walletType
      })
      .then(resp => {
        console.log(resp.data);
        if (resp.data.status === true) {
          // all good
          // show success image, on confirm empty state.
          this.setState({
            showSuccess: true,
            successMsg: "Added new wallet!",
            wallet_address: "",
            wallet_token_name: "",
            wallet_network: "",
            wallet_purpose: "",
            wallet_type: ""
          });
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
        console.log(err.response.data);
        this.setState({
          showError: true,
          errorMsg: err.response.data.error
        });
      });
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4>Add New Wallet</h4>
        </div>
        <div className="content">
          <form className="form-horizontal soft-input">
            <div className="form-group">
              <label className="col-md-4 control-label">Wallet Address</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.walletAddr}
                  onChange={this.handleWalletAddrChange}
                  placeholder="wallet address"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Wallet Type</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.walletType}
                  onChange={this.handleWalletTypeChange}
                  placeholder="burn or recipient"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="col-md-4 control-label">Purpose</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.purpose}
                  onChange={this.handlePurposeChange}
                  placeholder="purpose"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Network</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.network}
                  onChange={this.handleNetworkChange}
                  placeholder="network"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-md-4 control-label">Token</label>
              <div className="col-md-8">
                <input
                  type="text"
                  value={this.state.tokenName}
                  onChange={this.handleTokenNameChange}
                  placeholder="token it accepts"
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
                  Add Wallet
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

export default AddAddr;
