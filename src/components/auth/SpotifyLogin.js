import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth } from '../../redux/actions';

import config from '../../utils/spotify/config'
import { getAccessToken, getUserProfile } from '../../utils/spotify/auth';

import SpotifyButton from './SpotifyButton'

const ipcRenderer = window.require('electron').ipcRenderer;

class SpotifyLogin extends Component {
    onLoginClick = async () => {
        const { scope, showDialog, redirectURI } = config;
        const queryURL = `https://accounts.spotify.com/authorize?` +
                    `show_dialog=${showDialog}` +
                    `&scope=${scope.join('%20')}` +
                    `&response_type=code` +
                    `&redirect_uri=${redirectURI}` +
                    `&client_id=${process.env.APP_CLIENT_ID}`

        ipcRenderer.send('spotify-oauth', {
            queryURL
        })
        ipcRenderer.on('spotify-oauth-reply', (event, arg) => {
            if(typeof arg !== 'undefined' && arg.code) {
                this.getUser(arg)
            } else if (typeof arg !== 'undefined' && arg.error) {
                console.error(`ERROR: ${arg.error}`)
                alert(`ERROR: ${arg.error}`)
            } else {
                console.error('Error while authenticating with Spotify')
                alert('Error while authenticating with Spotify')
            }
        })
    }
    getUser = async (params) => {
        try {
            let auth = await getAccessToken(params)
            let user = await getUserProfile(auth)
            this.props.auth(user)
            return true
        } catch(err) {
            console.error(err)
            return false
        }
    }
  
    render() {  
        return (
            <SpotifyButton width={'180px'} padding={'12px 18px'} handleClick={this.onLoginClick}>
                Login With Spotify
            </SpotifyButton>
        )
    }
}

const mapDispatchToProps = {
    auth
};

export default connect(null, mapDispatchToProps)(SpotifyLogin)