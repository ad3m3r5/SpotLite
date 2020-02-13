/*import { CURRENTDEVICEID, DEVICEID, DEVICES, ERROR, ERRORTYPE,
        ACTIVE, INITIALIZING, MAGNIFIED, PLAYING, SAVED,
        UNSUPPORTED, NEEDSUPDATE, PREVIOUSTRACKS, NEXTTRACKS, POSITION,
        PROGRESS, STATUS, TRACK, VOLUME, MOUNTED, PLAYBACK } from '../actions';*/

import { PLAYBACK } from '../actions'

const initialState = {
    playback: {
        currentDeviceId: '',
        deviceId: '',
        devices: [],
        error: '',
        errorType: '',
        isActive: false,
        isInitializing: false,
        isMagnified: false,
        isPlaying: false,
        isSaved: false,
        isUnsupported: false,
        isMounted: false,
        needsUpdate: false,
        prevTracks: [],
        nextTracks: [],
        position: 0,
        progress: 0,
        status: 'IDLE',
        track: {
            artists: '',
            duration: 0,
            id: '',
            image: '',
            name: '',
            uri: '',
        },
        volume: 100,
        shuffle: false,
        repeat_mode: 0,
    }
}

function spotifyPlayback(state = initialState, action) {
    switch(action.type) {
        case PLAYBACK:
            return {
                playback: action.playback
            }
        default:
            return state
    }
}

export default spotifyPlayback