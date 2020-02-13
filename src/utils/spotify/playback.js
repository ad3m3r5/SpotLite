/*
    Based on the react-load-script module
    https://github.com/blueberryapps/react-load-script
*/

import { store } from '../../redux/store'
import { spotifyPlayback } from '../../redux/actions';

import { getSpotifyURIType, validateURI,
    getPlaybackState, setPlay, setPause,
} from '../spotify/player'


// load playback sdk script
export async function loadScript(attributes){
    if (!attributes) {
        throw new Error('No attributes found');
    }
    return new Promise((resolve, reject) => {
        let async = attributes.async || false;

        const scriptTag = document.getElementById('spotify-player');
        if (!scriptTag) {
            const script = document.createElement('script');
            script.async = async;
            script.defer = false;
            script.id = 'spotify-player';
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.type = 'text/javascript';
            script.onload = () => resolve(undefined);
            script.onerror = (error) => reject(`createScript: ${error.message}`);
            document.body.appendChild(script);
        } else {
            resolve();
        }
    });
}

// unlock playback sdk script
export function unloadScript() {
    document.querySelectorAll(`script[src='https://sdk.scdn.co/spotify-player.js']`).forEach(e => {
        e.parentNode.removeChild(e)
    })
    document.querySelectorAll("iframe[src='https://sdk.scdn.co/embedded/index.html']").forEach(e => {
        e.parentNode.removeChild(e)
    })
    // Just in case
    document.querySelectorAll(`script[id='spotify-player']`).forEach(e => {
        e.parentNode.removeChild(e)
    })
}

// update status of player
export function updateState(state) {
    let newState = {
        ...store.getState().plbk.playback,
        ...state
    }
    store.dispatch(spotifyPlayback(newState));
}

// Check if current device is an external player
export async function isExternalPlayer() {
    let playbackState = store.getState().plbk.playback;
    const {
        currentDeviceId,
        deviceId,
        status
    } = playbackState;
    return (currentDeviceId && currentDeviceId !== deviceId) || status === 'UNSUPPORTED';
}

// sync device with player
export async function syncDevice() {
    let playbackState = store.getState().plbk.playback;
    let authToken = store.getState().a.user.auth.access_token;

    if (!playbackState.isMounted) { return }

    try {
        const player = await getPlaybackState(authToken);
        let track = { artists: '', duration: 0, id: '',
            image: '', name: '', uri: '', }

        if (!player) {
            throw new Error('No player');
        }

        if (player.item) {
            track = {
                artists: player.item.artists.map(d => d.name).join(', '),
                duration: player.item.duration_ms,
                id: player.item.id,
                image: setAlbumImage(player.item.album),
                name: player.item.name,
                uri: player.item.uri,
            };
        }

        updateState({
            error: '',
            errorType: '',
            isActive: true,
            isPlaying: player.is_playing,
            nextTracks: [],
            prevTracks: [],
            progress: player.item ? player.progress_ms : 0,
            status: 'READY',
            track,
            volume: player.device.volume_percent,
        });
    } catch (error) {
        updateState({
            error: error.message,
            errorType: 'player_status',
            status: 'ERROR',
        });
    }
}

// get options to send to play
export function playOptions(uris = null) {
    const response = {
        context_uri: undefined,
        uris: undefined,
    }
    if (uris) {
        const ids = Array.isArray(uris) ? uris : [uris];
        if (ids.length > 1 && getSpotifyURIType(ids[0]) === 'track') {
            response.uris = ids.filter(d => validateURI(d) && getSpotifyURIType(d) === 'track');
        } else {
            response.context_uri = ids[0];
        }
    }
    return response;
}

export async function togglePlay(init = false) {
    let playbackState = store.getState().plbk.playback;
    let playerState = store.getState().play.player;
    let authToken = store.getState().a.user.auth.access_token;
    

    const { currentDeviceId, isPlaying, needsUpdate } = playbackState;
    const offset = 0;
    const shouldInitialize = init || needsUpdate;

    try {
        let isExternal = await isExternalPlayer()
        if (isExternal) {
            if (!isPlaying) {
                await setPlay({
                        deviceId: currentDeviceId,
                        offset,
                        ...(shouldInitialize ? playOptions() : undefined),
                    },
                    authToken,
                );
            } else {
                updateState({ isPlaying: false });
                await setPause(authToken);
            }
        } else if (playerState) {
            const newPlayerState = await playerState.getCurrentState();

            if (
                (!newPlayerState && !!(playOptions().context_uri || playOptions().uris)) ||
                (shouldInitialize && newPlayerState && newPlayerState.paused)
            ) {
                await setPlay({
                        deviceId: currentDeviceId,
                        offset,
                        ...(shouldInitialize ? playOptions() : undefined),
                    },
                    authToken,
                );
            } else {
                await playerState.togglePlay();
            }
        }

        if (needsUpdate) {
            updateState({ needsUpdate: false });
        }
    } catch (error) {
        console.error(error);
    }
}

// update the track seek slider
export async function updateSeekBar() {
    let playbackState = store.getState().plbk.playback;
    let playerState = store.getState().play.player;
    let seekUpdateInterval = 100;

    if (!playbackState.isMounted) { return }

    const { isPlaying, progress, track } = playbackState;

    try {
        if (isPlaying) {
            let isExternal = await isExternalPlayer()
            if (isExternal) {
                let position = progress / track.duration;
                position = Number.isFinite(position) ? position : 0;

                updateState({
                    position: Number((position * 100).toFixed(1)),
                    progress: progress + seekUpdateInterval,
                });
            } else if (playerState) {
                const state = (await playerState.getCurrentState());

                if (state) {
                    const position = state.position / state.track_window.current_track.duration_ms;

                    updateState({
                        position: Number((position * 100).toFixed(1))
                    });
                }
            }
        }
        return true
    } catch (error) {
        console.error(error);
    }
}

// return new album image url
export function setAlbumImage(album) {
    const width = Math.min(...album.images.map(d => d.width));
    const thumb = album.images.find(d => d.width === width) || ( {} );
    return thumb.url;
}