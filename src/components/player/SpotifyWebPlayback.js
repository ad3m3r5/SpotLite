/*
    I originally built the application only using calls to the api
    Much of the credit to receiving callbacks and sync data from the sdk goes to
    github.com/gilbarbara - https://github.com/gilbarbara/react-spotify-web-playback
*/

import { Component } from 'react';
import { connect } from 'react-redux';
import { spotifyPlayer } from '../../redux/actions';

import { loadScript, unloadScript, updateState, isExternalPlayer,
    syncDevice, setAlbumImage, playOptions, togglePlay,
    updateSeekBar,
} from '../../utils/spotify/playback';
import { isEqualArray, getDevices, setPlay,
    } from '../../utils/spotify/player'

class SpotifyWebPlayback extends Component {
    static defaultProps = {
        logging: false,
        autoPlay: false,
        callback: (state) => { if(this.defaultProps.logging) { console.log(state) } },
        offset: 0,
        persistDeviceSelection: false,
        play: false,
        syncExternalDeviceInterval: 5,
        updateSavedStatus: (status) => { if(this.defaultProps.logging) { console.log(status) } },
        uris: '',
    }
    emptyTrack = {
        artists: '',
        duration: 0,
        id: '',
        image: '',
        name: '',
        uri: '',
    };
    
    constructor(props) {
        super(props);
        this.state = {
            authToken: this.props.authToken,
            playback: this.props.playback,
            player: this.props.player,

            hasNewToken: false,
            playerProgressInterval: null,
            playerSyncInterval: null,
            syncTimeout: 300,
            seekUpdateInterval: 100,
        }
    }
    async componentDidMount() {
        updateState({ isMounted: true, status: 'INITIALIZING' })
        window.onSpotifyWebPlaybackSDKReady = this.initializePlayer;
        await loadScript({ async: false })
    }
    componentWillUnmount() {
        updateState({ isMounted: false })

        if (this.state.player) { this.state.player.disconnect() }

        clearInterval(this.state.playerSyncInterval);
        clearInterval(this.state.playerProgressInterval);
        clearTimeout(this.state.syncTimeout);

        unloadScript();
    }
    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.player !== this.props.player) {
            this.setState({ player: this.props.player })
        }
        if (prevProps.authToken !== this.props.authToken) {
            this.setState({ authToken: this.props.authToken })
        }
        if (prevProps.playback !== this.props.playback) {
            this.setState({ playback: this.props.playback })
        }

        const { currentDeviceId, deviceId, error,
            isInitializing, isPlaying, status, track
        } = this.state.playback;
        const { autoPlay, callback, offset,
            play, uris
        } = this.props;
        const isReady = prevState.playback.status !== 'READY' && status === 'READY'
        const changedURIs = Array.isArray(uris) ? !isEqualArray(prevProps.uris, uris) : uris;
        const canPlay = !!currentDeviceId && !!(playOptions(this.props.uris).context_uri || playOptions(this.props.uris).uris);
        const shouldPlay = !!(changedURIs && isPlaying) || !!(isReady && (autoPlay || play))

        if (canPlay && shouldPlay) {
            await setPlay({
                deviceId: currentDeviceId,
                offset,
                ...playOptions(this.props.uris)
            }, this.state.authToken);

            if (!isPlaying) {
                updateState({
                    isPlaying: true
                })
            }

            let isExternal = await isExternalPlayer()
            if (isExternal) {
                this.setState({
                    syncTimeout: window.setTimeout(() => {
                        syncDevice();
                    }, 600)
                })
            }
        } else if (changedURIs && !!isPlaying) {
            updateState({
                needsUpdate: true
            })
        }

        if (prevState.playback.status !== status) {
            callback({
                ...this.state.playback,
                type: 'status_update'
            })
        }

        if (prevState.playback.track.id !== track.id && track.id) {
            callback({
                ...this.state.playback
            })
        }

        if (prevState.playback.currentDeviceId !== currentDeviceId && currentDeviceId) {
            await this.handleDeviceChange()
            callback({
                ...this.state.playback
            })
        }

        if (prevState.playback.isPlaying !== isPlaying) {
            this.handlePlaybackStatus();
            await this.handleDeviceChange();
            callback({
                ...this.state.playback
            })
        }

        if (prevState.playback.isInitializing && !isInitializing) {
            if (error === 'authentication_error' && this.state.hasNewToken) {
                this.setState({ hasNewToken: false })
                this.initializePlayer();
            }
        }

        if (prevState.authToken && prevState.authToken !== this.state.authToken) {
            this.setState({ hasNewToken: true })
            if (!isInitializing) {
                this.initializePlayer();
            } else {
                this.setState({ hasNewToken: true })
            }
        }
        
        if (prevProps.play !== play && play !== isPlaying) {
            await togglePlay(true)
        }

        if (error === 'No Player') {
            updateState({
                currentDeviceId: deviceId,
                error: '',
                errorType: ''
            })
        }
    }
    // Change spotify active device
    async handleDeviceChange() {
        const { isPlaying } = this.state.playback;
        const { syncExternalDeviceInterval } = this.props;
        try {
            let isExternal = await isExternalPlayer()
            if (isExternal && isPlaying && !this.state.playerSyncInterval) {
                await syncDevice();

                this.setState({
                    playerSyncInterval: window.setInterval(
                        syncDevice(),
                        syncExternalDeviceInterval * 100
                    )
                })
            }

            if ((!isPlaying || !isExternal) && this.state.playerSyncInterval) {
                clearInterval(this.state.playerSyncInterval);
                this.setState({ playerSyncInterval: undefined })
            }
        } catch (error) {
            console.error(error);
        }
    }
    // Keep playback status synced
    handlePlaybackStatus = async () => {
        const { isPlaying } = this.state.playback;

        if (isPlaying) {
            if (!this.state.playerProgressInterval) {
                this.setState({
                    playerProgressInterval: window.setInterval(
                        updateSeekBar,
                        this.state.seekUpdateInterval,
                    )
                })
            }
        } else {
            if (this.state.playerProgressInterval) {
                clearInterval(this.state.playerProgressInterval);
                this.setState({ playerProgressInterval: undefined })
            }
        }
    }
    // Handle errors on playback sdk
    handlePlayerErrors = async (type, message) => {
        const { status } = this.state.playback;
        const isPlaybackError = type === 'playback_error';
        const isInitializationError = type === 'initialization_error';
        let nextStatus = status;

        if (this.state.player && !isPlaybackError) {
            await this.state.player.disconnect();
        }
        if (isInitializationError) {
            nextStatus = 'UNSUPPORTED';
        }
        if (!isInitializationError && !isPlaybackError) {
            nextStatus = 'ERROR';
        }
        updateState({
            error: message,
            errorType: type,
            isInitializing: false,
            isUnsupported: isInitializationError,
            status: nextStatus,
        });
    }
    // Handle player context changes
    handlePlayerStateChanges = async (state) => {
        if(this.props.logging) { console.log('State: ', state) }
        try {
            let isExternal = await isExternalPlayer()
            if (state) {
                const isPlaying = !state.paused;
                const {
                    album,
                    artists,
                    duration_ms,
                    id,
                    name,
                    uri
                } = state.track_window.current_track;
                const { shuffle, repeat_mode } = state;
                const volume = await this.state.player.getVolume() * 100 || this.state.playback.volume;
                const track = {
                    artists: artists.map(d => d.name).join(', '),
                    duration: duration_ms,
                    id,
                    image: setAlbumImage(album),
                    name,
                    uri,
                }

                updateState({
                    error: '',
                    errorType: '',
                    isActive: true,
                    isPlaying,
                    nextTracks: state.track_window.next_tracks,
                    prevTracks: state.track_window.previous_tracks,
                    track,
                    volume,
                    shuffle,
                    repeat_mode,
                });
            } else if (isExternal) {
                await syncDevice();
            } else {
                updateState({
                    isActive: false,
                    isPlaying: false,
                    nextTracks: [],
                    position: 0,
                    prevTracks: [],
                    track: {
                        artists: '',
                        duration: 0,
                        id: '',
                        image: '',
                        name: '',
                        uri: '',
                    },
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
    handlePlayerStatus = async (device_id, enable) => {
        if (enable) { sessionStorage.setItem('device_id', device_id); }
        if(this.props.logging) { console.log('Device ID: ' + device_id) }

        const {
            currentDeviceId,
            devices
        } = await this.initializeDevices(device_id);

        updateState({
            currentDeviceId,
            deviceId: device_id,
            devices,
            isInitializing: false,
            status: device_id ? 'READY' : 'IDLE',
        });
    }
    // initialize devices
    async initializeDevices(deviceId) {
        const {
            persistDeviceSelection
        } = this.props;
        const {
            authToken
        } = this.state
        const devices = await getDevices(authToken)
        let currentDeviceId = deviceId;

        if (persistDeviceSelection) {
            const savedDeviceId = sessionStorage.getItem('device_id');

            if (!savedDeviceId || !devices.find((d) => d.id === savedDeviceId)) {
                sessionStorage.setItem('device_id', currentDeviceId);
            } else {
                currentDeviceId = savedDeviceId;
            }
        }
        return { currentDeviceId, devices }
    }
    // initialize spotify player
    initializePlayer = () => {
        updateState({
            isInitializing: true
        });

        var newPlayer = new window.Spotify.Player({
            name: 'SpotLite',
            getOAuthToken: cb => { cb(this.state.authToken) }
        });
        this.props.spotifyPlayer(newPlayer)
        this.state.player.addListener('initialization_error', (error) =>
            this.handlePlayerErrors('initialization_error', error), );
        this.state.player.addListener('authentication_error', (error) =>
            this.handlePlayerErrors('authentication_error', error), );
        this.state.player.addListener('account_error', (error) =>
            this.handlePlayerErrors('account_error', error), );
        this.state.player.addListener('playback_error', (error) =>
            this.handlePlayerErrors('playback_error', error), );
        this.state.player.addListener('ready', ({device_id}) => {
            this.handlePlayerStatus(device_id, true)
        })
        this.state.player.addListener('not_ready', ({device_id}) => {
            this.handlePlayerStatus(device_id, false)
        });
        this.state.player.addListener('player_state_changed', this.handlePlayerStateChanges);

        this.state.player.connect().then(() => {
            if(this.props.logging) { console.log('The connection to Spotify has been established.') }
        });
    }

    render() {
        return (
            null
        )
    }
}

const mapStateToProps = state => {
    return {
        playback: state.plbk.playback,
        player: state.play.player,
        authToken: state.a.user.auth.access_token,
    }
};

const mapDispatchToProps = {
    spotifyPlayer
};

export default connect(mapStateToProps, mapDispatchToProps)(SpotifyWebPlayback)