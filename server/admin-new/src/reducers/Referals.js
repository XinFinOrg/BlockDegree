import { FETCH_REFERALS } from "../actions/types";
export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case FETCH_REFERALS: {
            return action.payload;
        }
        default:
            return state;
    }
}