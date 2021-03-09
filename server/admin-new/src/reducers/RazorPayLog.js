import { FETCH_RAZOR_PAY_LOG } from "../actions/types";
export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case FETCH_RAZOR_PAY_LOG: {
            return action.payload;
        }
        default:
            return state;
    }
}