import React, { Component } from 'react';

import SpotifyButton from './SpotifyButton'

class SpotifyLogout extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {  
        return (
            <SpotifyButton width={'180px'} padding={'12px 18px'} handleClick={this.props.onLogout}>
                Logout Of Spotify
            </SpotifyButton>
        )
    }
}

export default SpotifyLogout