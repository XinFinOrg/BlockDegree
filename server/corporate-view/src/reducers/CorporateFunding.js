import { FETCH_CORPORATE_FUNDING } from "../actions/types";

export default function (state = null, action) {
  if (action.type === FETCH_CORPORATE_FUNDING) {
    return action.payload;
  }
  return state;
}
