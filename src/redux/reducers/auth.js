import { AUTH } from '../actions';

const initialState = {
    user: null
}

function auth(state = initialState, action) {
    switch(action.type) {
        case AUTH:
            return {
                user: action.user
            }
        default:
            return state
    }
}

export default auth