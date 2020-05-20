import React from "react";
import { useHistory } from "react-router-dom";

function RouteButton(props) {
  const history = useHistory();

  function handleClick() {
    history.push(props.to);
  }

  return <div className="route-btn" onClick={handleClick}>{props.value}</div>;
}

export default RouteButton;
