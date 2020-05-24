import * as types from "./types";
import axios from "axios";

export const fetchCorporateUser = () => async (dispatch) => {
  let res = await axios.get("/api/getCorporateUser", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
  res = res.data;
  res["fetchedTS"] = Date.now();
  if (res.status === true) {
    localStorage.setItem(
      "corp-auth-status",
      res.auth === true ? "true" : "false"
    );
    localStorage.setItem("corp-auth-ts", Date.now() + "");
    dispatch({
      type: types.FETCH_CORPORATE_USER,
      payload: res,
    });
  } else {
    localStorage.setItem("corp-auth-status", "false");
    localStorage.setItem("corp-auth-ts", Date.now() + "");
    //handle error pipeline for dispatch
  }
};

export const fetchAllFunds = () => async (dispatch) => {
  let res = await axios.get("/api/getAllFundsCorp", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
  res = res.data;
  if (res.status === true) {
    res["fetchedTS"] = Date.now();
    dispatch({
      type: types.FETCH_ALL_FUNDS,
      payload: res,
    });
  } else {
    //handle error pipeline for dispatch
  }
};

export const fetchCorporateFunding = () => async (dispatch) => {
  let res = await axios.get("/api/getCorpFunding");
  res = res.data;
  console.log("fetchCorporateFunding: ", res);
  if (res.status === true) {
    res["fetchedTS"] = Date.now();
    dispatch({ type: types.FETCH_CORPORATE_FUNDING, payload: res });
  } else {
    // handle  error
  }
};
