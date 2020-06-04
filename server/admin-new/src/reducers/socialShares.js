import { FETCH_SOCIAL_SHARE } from "../actions/types";

export default function (state = null, action) {
  if (action.type === FETCH_SOCIAL_SHARE) {
    return action.payload;
  }
  return state;
}
