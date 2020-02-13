import { combineReducers } from 'redux';

import auth from './auth';
import playback from './playback';
import player from './player';

const rootReducer = combineReducers({
    a: auth,
    plbk: playback,
    play: player,
});

export default rootReducer