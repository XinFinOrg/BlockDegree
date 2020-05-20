import React from "react";
import { Redirect } from "react-router-dom";

function RequireLogout() {
  const currPath = document.location.pathname;
  const toLink = `/`;
  const initialAuth = localStorage.getItem("corp-auth-status") == "true";

  console.log("INSIDE RequireLogout: ", currPath, toLink, initialAuth);

  if (initialAuth === true) {
    return (
      <>
        <Redirect to={toLink} />
      </>
    );
  } else {
    return <></>;
  }
}

export default RequireLogout;
