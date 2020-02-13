import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import SpotifyWebPlayback from './player/SpotifyWebPlayback'
import { setPlay, getRecentlyPlayed, getSavedItems, getPlaylistUris,
    } from '../utils/spotify/player'

import SideNav from './player/SideNav'
import UserLibrary from './player/UserLibrary'

const PageWrapper = styled.div`
    width: 600px;
    height: 250px;
    max-height: 250px;
    color: white;
    display: flex;
    align-items: center;
`;
const ImageWrapper = styled.div`
    width: 600px;
    height: 250px;
    opacity: 0.8;
    text-align: center;
    font-size: 30px;
    box-sizing: border-box;
    display: inline-block;
    position: relative;
    line-height: 250px;
`;
const Greeting = styled.p`
    display: inline-block;
    vertical-align: middle;
    padding: 0px 28px;
    line-height: 115%;
`;

class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
            display: {},
            library: {
                recent: [],
                tracks: [],
                albums: [],
                artists: [],
                playlists: [],
            },
            loaded: false,
        }
    }
    componentDidMount() {
        this.interval = setInterval(() => {
            if(this.props.isAuth && this.props.user.auth.access_token !== null) {
                this.loadLibrary(this.props.user.auth.access_token)
            }
        }, 60000)

        if (this.props.isAuth && this.props.user.auth.access_token !== null) {
            this.loadLibrary(this.props.user.auth.access_token)
        }
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isAuth !== this.props.isAuth && this.props.isAuth) {
            this.loadLibrary(this.props.user.auth.access_token)
        }
    }
    loadLibrary = async (token) => {
        let library = {};
        library.recent = await getRecentlyPlayed(token) // recently played
        library.tracks = await getSavedItems(token, "tracks"); // saved tracks
        library.albums = await getSavedItems(token, "albums"); // saved albums
        library.artists = await getSavedItems(token, "artists"); // followed artists
        library.playlists = await getSavedItems(token, "playlists"); // user's playlists
        this.setState({ loaded: true, library })
    }
    handleChangeDisplay = async (event) => {
        const { dataset } = event.currentTarget;
        const { library } = this.state
        const authToken = this.props.user.auth.access_token;

        var newDisplay = {};
        newDisplay.type = dataset.type;

        if (newDisplay.type === 'recent') {
            newDisplay.name = 'Recently Played';
            newDisplay.tracks = library.recent;
        }
        if (newDisplay.type === 'tracks') {
            newDisplay.name = 'Liked Songs';
            newDisplay.tracks = library.tracks;
        }
        if (newDisplay.type === 'albums') {
            let sortedAlbums = library.albums;
            sortedAlbums.sort((a, b) => {
                let nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
                if (nameA < nameB) { return -1 }
                if (nameA > nameB) { return 1 }
                return 0
            })
            newDisplay.data = sortedAlbums;
        }
        if (newDisplay.type === 'artists') {
            let sortedAlbums = library.artists;
            sortedAlbums.sort((a, b) => {
                let nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
                if (nameA < nameB) { return -1 }
                if (nameA > nameB) { return 1 }
                return 0
            })
            newDisplay.data = sortedAlbums;
        }
        if (newDisplay.type === 'playlist') {
            newDisplay.name = dataset.name;
            newDisplay.uri = dataset.uri;
            newDisplay.tracks = await await getPlaylistUris(authToken, dataset.uri)
        }
        this.setState({ display: newDisplay });
    }
    handlePlaySet = async (event) => {
        const { dataset } = event.currentTarget;
        const { currentDeviceId } = this.props.playback;
        const authToken = this.props.user.auth.access_token;
        if (dataset.type === 'recent' || dataset.type === 'tracks') {
            let tracks = JSON.parse(dataset.tracks)
            let trackUris = [];
            Object.keys(tracks).map((item, i) => {
                trackUris.push(tracks[item].uri)
                return tracks[item]
            })
            await setPlay({
                uris: trackUris,
                deviceId: currentDeviceId,
            }, authToken)
        }
        if (dataset.type === 'album' || dataset.type === 'artist' || dataset.type === 'playlist') {
            await setPlay({
                context_uri: dataset.uri,
                deviceId: currentDeviceId,
            }, authToken)
        }
    }
    render() {
        return (
            <PageWrapper>
                {this.props.user !== null && this.props.isAuth
                ? <Fragment>
                    {this.props.user && this.props.user.profile.product === "premium"
                    ? <Fragment>
                        <SpotifyWebPlayback />
                        {this.props.playback.isMounted
                        ? <Fragment>
                            <SideNav
                                authToken={this.props.user.auth.access_token}
                                library={this.state.library}
                                loaded={this.state.loaded}
                                handleChangeDisplay={this.handleChangeDisplay}
                                display={this.state.display}
                            />
                            <UserLibrary
                                authToken={this.props.user.auth.access_token}
                                library={this.state.library}
                                loaded={this.state.loaded}
                                handleChangeDisplay={this.handleChangeDisplay}
                                display={this.state.display}
                                handlePlaySet={this.handlePlaySet}
                            />
                          </Fragment>
                        : null
                        }
                        </Fragment>
                    : <Fragment>
                        <ImageWrapper className="image-wrapper">
                            <Greeting>You must be a premium user to use this app</Greeting>
                        </ImageWrapper>
                      </Fragment>
                    }
                  </Fragment>
                : <Fragment>
                    <ImageWrapper className="image-wrapper">
                        <Greeting>Welcome to SpotLite</Greeting>
                    </ImageWrapper>
                  </Fragment>
                }
            </PageWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.a.user,
        playback: state.plbk.playback,
    };
};

export default connect(mapStateToProps, null)(Header)