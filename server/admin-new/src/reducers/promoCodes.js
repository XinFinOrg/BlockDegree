import { FETCH_ALL_PROMOCODES } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_ALL_PROMOCODES: {
      return action.payload;
    }
    default:
      return state;
  }
}
