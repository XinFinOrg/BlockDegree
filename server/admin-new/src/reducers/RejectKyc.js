import { REJECT_KYCUSER } from "../actions/types";
export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case REJECT_KYCUSER: {
            return action.payload;
        }
        default:
            return state;
    }
}