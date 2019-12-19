import axios from "axios";
import {
  FETCH_USER,
  FETCH_COURSE_VISITS,
  FETCH_ALL_USER,
  FETCH_ALL_PROMOCODES,
  FETCH_ALL_REFERRAL_CODES,
  FETCH_ALL_PROMOCODE_LOGS,
  FETCH_ALL_BURN_LOGS,
  FETCH_ALL_PAYMENT_LOGS,
  FETCH_ALL_CRYPTO_LOGS
} from "./types";

export const fetchUser = () => async dispatch => {
  console.log("called Fetch User");
  const res = await axios.get("/api/current_user", { withCredentials: true });
  console.log("cresponse from server", res);
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const fetchCourseVisits = () => async dispatch => {
  console.log("called Fetch Course Visits");
  const res = await axios.get("/api/getCourseVisits", {
    withCredentials: true
  });
  dispatch({ type: FETCH_COURSE_VISITS, payload: res.data });
};

export const fetchAllUser = () => async dispatch => {
  console.log("called fetch all user");
  const res = await axios.get("/api/getAllUser", { withCredentials: true });
  dispatch({ type: FETCH_ALL_USER, payload: res.data });
};

export const fetchAllPromoCodes = () => async dispatch => {
  console.log("called fetch all promocodes");
  const res = await axios.get("/api/getAllPromoCodes", {
    withCredentials: true
  });
  dispatch({ type: FETCH_ALL_PROMOCODES, payload: res.data });
};

export const fetchAllReferralCodes = () => async dispatch => {
  console.log("called fetch all referral codes");
  const res = await axios.get("/api/getAllReferralCodes", {
    withCredentials: true
  });
  dispatch({ type: FETCH_ALL_REFERRAL_CODES, payload: res.data });
};

export const fetchAllPromoCodeLog = () => async dispatch => {
  console.log("called fetch all promocode logs");
  const res = await axios.get("/api/getPromoCodeLogs", {
    withCredentials: true
  });
  dispatch({ type: FETCH_ALL_PROMOCODE_LOGS, payload: res.data });
};

export const fetchAllBurnLog = () => async dispatch => {
  console.log("called fetch all burn logs");
  const res = await axios.get("/api/getBurnLogs", { withCredentials: true });
  dispatch({ type: FETCH_ALL_BURN_LOGS, payload: res.data });
};

export const fetchAllPaymentLog = () => async dispatch => {
  console.log("called fetch all payment logs");
  const res = await axios.get("/api/getPaymentLogs", { withCredentials: true });
  dispatch({ type: FETCH_ALL_PAYMENT_LOGS, payload: res.data });
};

export const fetchAllCryptoLog = () => async dispatch => {
  console.log("called fetch all crypto logs");
  const res = await axios.get("/api/getCryptoLogs", { withCredentials: true });
  dispatch({ type: FETCH_ALL_CRYPTO_LOGS, payload: res.data });
};
