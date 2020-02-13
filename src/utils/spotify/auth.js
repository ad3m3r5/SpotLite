import axios from 'axios';
import querystring from 'querystring'

import config from './config'

export async function getAccessToken(data) {
    return await axios.post('https://accounts.spotify.com/api/token', 
        querystring.stringify({
            code: data.code,
            redirect_uri: config.redirectURI,
            grant_type: 'authorization_code'
        }), {
        headers: {
            'Authorization': 'Basic ' + (new Buffer(process.env.REACT_APP_CLIENT_ID + ':' + process.env.REACT_APP_CLIENT_SECRET).toString('base64'))
        }
    }).then(response => {
        if (response.status === 200) {
            return response.data
        }
    }).catch((err) => {
        console.error(err)
    })
}

export async function getTokenRefresh(user) {
    return await axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: user.auth.refresh_token
        }), {
        headers: {
            'Authorization': 'Basic ' + (new Buffer(process.env.REACT_APP_CLIENT_ID + ':' + process.env.REACT_APP_CLIENT_SECRET).toString('base64'))
        }
    }).then(response => {
        if (response.status === 200) {
            return response.data.access_token
        }
    }).catch((err) => {
        console.error(err)
    })
}

export async function getUserProfile(data) {
    return await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + data.access_token
        }
    }).then(response => {
        if (response.status === 200) {
            let user = {
                profile: response.data,
                auth: {
                    ...data,
                    tokenTime: (new Date()).getTime()
                }
            }
            return user
        }
    }).catch((err) => {
        console.error(err)
    })
}