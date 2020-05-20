import { FETCH_ALL_FUNDS } from "../actions/types";

export default function (state = null, action) {
  if (action.type === FETCH_ALL_FUNDS) {
    return action.payload;
  }
  return state;
}
