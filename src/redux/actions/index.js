export const AUTH = 'AUTH';
export const PLAYBACK = 'PLAYBACK';
export const PLAYER = 'PLAYER';

// User profile and auth
export function auth(user) {
    return { type: AUTH, user: user }
}

// playback state
export function spotifyPlayback(playback) {
    return { type: PLAYBACK, playback: playback }
}

// player object
export function spotifyPlayer(player) {
    return { type: PLAYER, player: player }
}
