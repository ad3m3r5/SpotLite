import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth } from '../../redux/actions';

import config from '../../utils/spotify/config'
import { getAccessToken, getUserProfile } from '../../utils/spotify/auth';

import SpotifyButton from './SpotifyButton'

class SpotifyLogin extends Component {
    onLoginClick = () => {
        const { scope, showDialog } = config;
        const queryURL = `https://accounts.spotify.com/authorize?` +
                    `show_dialog=${showDialog}` +
                    `&scope=${scope.join('%20')}` +
                    `&response_type=code` +
                    `&redirect_uri=${config.redirectURI}` +
                    `&client_id=${process.env.REACT_APP_CLIENT_ID}`

        const popup = window.open(
            queryURL,
            'spotify-login',
            "width=400, height=650"
        );

        this.awaitCode(popup, queryURL)
    }
    awaitCode = async (popup, origUrl) => {
        this.interval = window.setInterval(async () => {
            try {
                let url = popup.location.href

                // popup closed
                if(!popup || popup.closed) {
                    window.clearInterval(this.interval)
                    console.error('Login portal closed')
                }

                // code param received
                if(url !== origUrl && typeof url !== 'undefined') {
                    let params = this.getParams(url)
                    if (params.code !== null) {
                        let userSuccess = await this.getUser(params)
                        if (userSuccess) {
                            window.clearInterval(this.interval)
                            popup.close()
                        }
                    }
                }
            } catch(err) {
                console.error(err)
            }
        }, 500);
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
    getParams = (url) => {
        let params = {};
        url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function(m,key,value) {
            params[key] = value;
        });
        return params;
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