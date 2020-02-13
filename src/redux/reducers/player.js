import { PLAYER } from '../actions';

const initialState = {
    player: null
}

function spotifyPlayer(state = initialState, action) {
    switch(action.type) {
        case PLAYER:
            return {
                player: action.player
            }
        default:
            return state
    }
}

export default spotifyPlayer