import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import reduxStore from "./redux/store";
import { createBrowserHistory } from "history";

const customHistory = createBrowserHistory();

const store = reduxStore();

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <Router history={customHistory}>
        <App />
      </Router>
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
