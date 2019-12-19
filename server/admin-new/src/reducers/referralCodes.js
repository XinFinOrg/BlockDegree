import { FETCH_ALL_REFERRAL_CODES } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_ALL_REFERRAL_CODES: {
      return action.payload;
    }
    default:
      return state;
  }
}
