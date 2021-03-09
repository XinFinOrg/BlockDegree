import { FETCH_FUND_MY_DEGREE } from "../actions/types";
export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case FETCH_FUND_MY_DEGREE: {
            return action.payload;
        }
        default:
            return state;
    }
}