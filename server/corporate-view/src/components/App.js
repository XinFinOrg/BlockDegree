import React from "react";
import { Redirect, Route } from "react-router-dom";
import "../assets/scss/main.scss";
import Header from "./Header";
import Dashboard from "../containers/Dashboard";
import SignUp from "./Signup";
import Login from "./Login";
import ReactNotification from "react-notifications-component";
import NotFound from "./NotFound";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-notifications-component/dist/theme.css";

function App() {
  return (
    <div className="App">
      <ReactNotification />
      <Header />
      <Route exact path="/" component={Dashboard} />
      <Route exact path="/signup" component={SignUp} />
      <Route exact path="/login" component={Login} />
      {/* <Route exact path="/404" component={NotFound} /> */}
      <Redirect from="*" to="/" />
    </div>
  );
}

export default App;
