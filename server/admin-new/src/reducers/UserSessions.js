import { FETCH_ALL_USER_SESSIONS } from "../actions/types";
export default function(state = null, action) {
  console.log("userData action",action);
  switch (action.type) {
    case FETCH_ALL_USER_SESSIONS: {
      return action.payload.data;
    }
    default:
      return state;
  }
}
