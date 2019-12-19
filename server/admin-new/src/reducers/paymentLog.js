import { FETCH_ALL_PAYMENT_LOGS } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_ALL_PAYMENT_LOGS: {
      return action.payload;
    }
    default:
      return state;
  }
}
