import React from "react";
import { Redirect } from "react-router-dom";

function RequireLogin() {
  const currPath = document.location.pathname;
  const toLink = `/login?from=${currPath.slice(1)}`;
  const initialAuth = localStorage.getItem("corp-auth-status") == "true";

  console.log("INSIDE RequireLogin: ", currPath, toLink, initialAuth);

  if (initialAuth === false) {
    return (
      <>
        <Redirect to={toLink} />
      </>
    );
  } else {
    return <></>;
  }
}

export default RequireLogin;
