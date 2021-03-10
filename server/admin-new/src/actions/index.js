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
  FETCH_ALL_CRYPTO_LOGS,
  FETCH_ALL_FUNDS,
  FETCH_XDC_PRICE,
  FETCH_SOCIAL_SHARE,
  FETCH_ALL_USER_SESSIONS,
  FETCH_ALL_KYCUSER,
  FETCH_FUND_MY_DEGREE,
  FETCH_REFERALS,
  FETCH_RAZOR_PAY_LOG
} from "./types";

/*

  Current Timestamp has been appended to the res.data as res.fetchedTS.
  This will represent last-updated-time of the data on a given chart/table/log

*/

export const fetchUser = () => async (dispatch) => {
  console.log("called Fetch User");
  const res = await axios.get("/api/current_user", { withCredentials: true });
  console.log("response from server", res);
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const fetchCourseVisits = () => async (dispatch) => {
  console.log("called Fetch Course Visits");
  const res = await axios.get("/api/getCourseVisits", {
    withCredentials: true,
  });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_COURSE_VISITS, payload: res.data });
};

export const fetchAllUser = () => async (dispatch) => {
  console.log("called fetch all user");
  const res = await axios.get("/api/getAllUser", { withCredentials: true });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_USER, payload: res.data });
};

export const fetchAllPromoCodes = () => async (dispatch) => {
  console.log("called fetch all promocodes");
  const res = await axios.get("/api/getAllPromoCodes", {
    withCredentials: true,
  });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_PROMOCODES, payload: res.data });
};

export const fetchAllKycUser = () => async (dispatch) => {
  console.log("called fetch all kyc user");
  const res = await axios.get("/api/getKycUser");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_KYCUSER, payload: res.data });
};

export const fetchFundMyDegree = () => async (dispatch) => {
  console.log("called fetch all fund my degree");
  const res = await axios.get("/api/getfundmydegree");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_FUND_MY_DEGREE, payload: res.data });
};

export const fetchRazorPayLog = () => async (dispatch) => {
  console.log("called fetch all Razor Pay Log");
  const res = await axios.get("/api/getrazorpaylog");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_RAZOR_PAY_LOG, payload: res.data });
};

export const fetchReferals = () => async (dispatch) => {
  console.log("called fetch all Referal");
  const res = await axios.get("/api/getuserreferals");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_REFERALS, payload: res.data });
};

export const fetchKycUserPic = (data) => async (dispatch) => {
  console.log("called fetch kyc user pic", data);
  const res = await axios.get(`/api/getKycUserPic/${ data }`);
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_REFERALS, payload: res.data });
};

export const rejectKycUser = (data) => async (dispatch) => {
  console.log("called fetch kyc user pic", data);
  const res = await axios.post('/api/rejectKycUser', { email: data });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_REFERALS, payload: res.data });
};

export const approveKycUser = (data) => async (dispatch) => {
  console.log("called fetch kyc user pic", data);
  const res = await axios.post('/api/approveKycUser', { email: data });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_REFERALS, payload: res.data });
};

export const fetchAllUserSessions = () => async (dispatch) => {
  console.log("called fetch all promocodes");
  const res = await axios.get("/api/getUserSessions", {
    withCredentials: true,
  });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_USER_SESSIONS, payload: res.data });
};


export const fetchAllReferralCodes = () => async (dispatch) => {
  console.log("called fetch all referral codes");
  const res = await axios.get("/api/getAllReferralCodes", {
    withCredentials: true,
  });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_REFERRAL_CODES, payload: res.data });
};

export const fetchAllPromoCodeLog = () => async (dispatch) => {
  console.log("called fetch all promocode logs");
  const res = await axios.get("/api/getPromoCodeLogs", {
    withCredentials: true,
  });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_PROMOCODE_LOGS, payload: res.data });
};

export const fetchAllBurnLog = () => async (dispatch) => {
  console.log("called fetch all burn logs");
  const res = await axios.get("/api/getBurnLogs", { withCredentials: true });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_BURN_LOGS, payload: res.data });
};

export const fetchAllPaymentLog = () => async (dispatch) => {
  console.log("called fetch all payment logs");
  const res = await axios.get("/api/getPaymentLogs", { withCredentials: true });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_PAYMENT_LOGS, payload: res.data });
};

export const fetchAllCryptoLog = () => async (dispatch) => {
  console.log("called fetch all crypto logs");
  const res = await axios.get("/api/getCryptoLogs", { withCredentials: true });
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_CRYPTO_LOGS, payload: res.data });
};

export const fetchAllFunds = () => async (dispatch) => {
  const res = await axios.get("/api/getAllFunds");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_ALL_FUNDS, payload: res.data });
};

export const fetchXdcPrice = () => async (dispatch) => {
  const res = await axios.get("/api/wrapCoinMarketCap");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_XDC_PRICE, payload: res.data });
};

export const fetchSocialShares = () => async (dispatch) => {
  const res = await axios.get("/api/getSocialShares");
  res.data["fetchedTS"] = Date.now();
  dispatch({ type: FETCH_SOCIAL_SHARE, payload: res.data });
};
