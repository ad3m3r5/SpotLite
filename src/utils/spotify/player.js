import axios from 'axios'

// get uri type
export function getSpotifyURIType(uri) {
    const [, type = ''] = uri.split(':');

    return type;
}

// check if array is equal
export function isEqualArray(A, B) {
    if (!Array.isArray(A) || !Array.isArray(B) || A.length !== B.length) {
        return false;
    }

    let result = true;

    A.forEach((a) =>
        B.forEach((b) => {
            result = a === b;
        }),
    );

    return result;
}

// validate given uri
export function validateURI(input) {
    let isValid = false;

    /* istanbul ignore else */
    if (input && input.indexOf(':') > -1) {
        const [key, type, id] = input.split(':');

        /* istanbul ignore else */
        if (key && type && type !== 'user' && id && id.length === 22) {
            isValid = true;
        }
    }

    return isValid;
}

// get connected user devices
export async function getDevices(token) {
    return await axios.get(`https://api.spotify.com/v1/me/player/devices`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response.data.devices) { return response.data.devices }
        return response
    }).catch((err) => { console.error(err) })
}

// get currenty playback state
export async function getPlaybackState(token) {
    return await axios.get(`https://api.spotify.com/v1/me/player`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        //if (response.status === 204) { return }
        //else { return response }
        return response
    }).catch((err) => { console.error(err) })
}

// set current/new track/uri to play/resume
export async function setPlay({context_uri, deviceId, offset = 0, uris}, token) {
    let body;
    if (context_uri) { 
        const isArtist = context_uri.indexOf(':artist:') >= 0;
        let position;
        if (!isArtist) { position = {position: offset} }
        body = JSON.stringify({ context_uri, offset: position })
    } else if (Array.isArray(uris) && uris.length) {
        body = JSON.stringify({ uris, offset:{position:offset} })
    }
    return await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        body, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// set current track to pause
export async function setPause(token) {
    return await axios.put(`https://api.spotify.com/v1/me/player/pause`,
    JSON.stringify({}), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// skip to previous song
export async function skipPrev(token) {
    return await axios.post(`https://api.spotify.com/v1/me/player/previous`,
    JSON.stringify({}), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// skip to next song
export async function skipNext(token) {
    return await axios.post(`https://api.spotify.com/v1/me/player/next`,
    JSON.stringify({}), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// seek playing track
export async function seek(token, position) {
    return await axios.put(`https://api.spotify.com/v1/me/player/seek?position_ms=${position}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// set active device
export async function setDevice(token, deviceId) {
    return await axios.put(`https://api.spotify.com/v1/me/player`,
    JSON.stringify({ device_ids: [deviceId], play: true }) ,{
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// set playback volume
export async function setVolume(token, volume) {
    return await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`,
    JSON.stringify({}), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).catch((err) => { console.error(err) })
}

// set shuffle state
export async function setShuffle(token, state) {
    let context = true;
    if (!state) { context = false }
    return await axios.put(`https://api.spotify.com/v1/me/player/shuffle?state=${context}`,
    JSON.stringify({}), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response) { return response }
    }).catch((err) => { return err.response })
}

// set repeat state
export async function setRepeat(token, state) {
    let context = 'off';
    if (state === 1) { context = 'context' }
    if (state === 2) { context = 'track' }
    return await axios.put(`https://api.spotify.com/v1/me/player/repeat?state=${context}`,
    JSON.stringify({}), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        if (response) { return response }
    }).catch((err) => { return err.response })
}

// Get User saved Tracks, Albums, Artists, playlists
export async function getSavedItems(token, itemType) {
    let dataType = '';
    if (itemType === "artists") { itemType = "following"; dataType = "?type=artist" }
    return await axios.get(`https://api.spotify.com/v1/me/${itemType}${dataType}`,
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then((response) => {
        if (response.status === 200) {
            if (itemType === "tracks") { 
                var savedTracks = [];
                response.data.items.forEach((t) => {
                    savedTracks.push(t.track)
                })
                return savedTracks
            }
            if (itemType === "albums") { 
                var savedAlbums = [];
                response.data.items.forEach((a) => {
                    savedAlbums.push(a.album)
                })
                return savedAlbums
            }
            if (itemType === "following") {
                return response.data.artists.items
            }
            if (itemType === "playlists") {
                return response.data.items
            }
        } else { return null }
    }).catch((err) => {
        console.error(err)
    })
}

// Get Current User's Recently Played Tracks
export async function getRecentlyPlayed(token) {
    return await axios.get(`https://api.spotify.com/v1/me/player/recently-played?limit=50`,
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then((response) => {
        if (response.status === 200) {
            var recentlyPlayed = [];
            var recentURIs = [];
            response.data.items.forEach((t) => {
                let exists = recentURIs.includes(t.track.uri)
                if (!exists) {
                    recentURIs.push(t.track.uri)
                    recentlyPlayed.push(t.track)
                }
            })
            return recentlyPlayed;
        } else { return null }
    }).catch((err) => {
        console.error(err)
    })
}

// Get playlist tracks/uris
export async function getPlaylistUris(token, uri) {
    let id = uri.split("playlist:")[1]
    return await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`,
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then((response) => {
        if (response.status === 200) {
            var tracks = [];
            response.data.items.forEach((t) => {
                tracks.push(t.track)
            })
            return tracks
        }
    }).catch((err) => {
        console.error(err)
    })
}