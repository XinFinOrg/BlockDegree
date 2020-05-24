import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import "../assets/scss/main.scss";
import Header from "./Header";
import Dashboard from "../containers/Dashboard";
import SignUp from "./Signup";
import Login from "./Login";
import ReactNotification from "react-notifications-component";
import Footer from "./Footer";
import Profile from "./Profile";
import NotFound from "./NotFound";
import { ToastContainer } from 'react-toastify';


import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import "react-notifications-component/dist/theme.css";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <ReactNotification />
      <ToastContainer />
      <Header />
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/profile" component={Profile} />
        <Redirect from="*" to="/" />
      </Switch>
      {/* <Route exact path="/404" component={NotFound} /> */}
      <Footer />
    </div>
  );
}

export default App;
