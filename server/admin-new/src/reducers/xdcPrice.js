import { FETCH_XDC_PRICE } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_XDC_PRICE: {
      return action.payload;
    }
    default:
      return state;
  }
}
