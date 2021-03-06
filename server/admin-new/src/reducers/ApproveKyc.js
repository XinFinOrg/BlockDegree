import { APPROVE_KYCUSER } from "../actions/types";
export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case APPROVE_KYCUSER: {
            return action.payload;
        }
        default:
            return state;
    }
}