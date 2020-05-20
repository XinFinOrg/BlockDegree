import { FETCH_CORPORATE_USER } from "../actions/types";

export default function (state = null, action) {
  if (action.type === FETCH_CORPORATE_USER) {
    return action.payload;
  }
  return state;
}
