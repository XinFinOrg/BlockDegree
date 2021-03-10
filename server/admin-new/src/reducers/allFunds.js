import { FETCH_ALL_FUNDS } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_ALL_FUNDS: {
      return action.payload;
    }
    default:
      return state;
  }
}