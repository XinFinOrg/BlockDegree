import * as types from "../actions/types";

export default function (state = null, action) {
  switch (action.type) {
    case types.FETCH_SITE_STATS: {
      return action.payload;
    }
    default:
      return state;
  }
}
