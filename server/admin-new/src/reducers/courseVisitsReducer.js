import { FETCH_COURSE_VISITS } from "../actions/types";
export default function(state = null, action) {
  console.log(action);
  switch (action.type) {
    case FETCH_COURSE_VISITS: {
      return action.payload;
    }
    default:
      return state;
  }
}
