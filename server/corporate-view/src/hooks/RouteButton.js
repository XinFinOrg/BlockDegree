import React from "react";
import { useHistory } from "react-router-dom";

function RouteButton(props) {
  const history = useHistory();
  let finalClassName = "";

  function handleClick() {
    history.push(props.to);
  }

  if (props.className !== undefined) {
    finalClassName = `route-btn ${props.className}`;
  } else {
    finalClassName = "route-btn";
  }

  return (
    <div className={finalClassName} onClick={handleClick}>
      {props.value}
    </div>
  );
}

export default RouteButton;

export const RedirectTo = (to) => {
  const history = useHistory();
  history.push(to);
};
