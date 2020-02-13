import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { PlayCircleOutline, PauseCircleOutline,
    SkipPrevious, SkipNext,
    } from '@material-ui/icons';

import { isExternalPlayer, syncDevice, togglePlay, updateState } from '../../utils/spotify/playback';
import { skipPrev, skipNext } from '../../utils/spotify/player';

import VolumeControls from './VolumeControls';
import ShuffleRepeatControls from './ShuffleRepeatControls';

const PlayPauseButton = styled.button`
    color: rgba(255,255,255,0.75);
    background: none;
    border: none;
    outline: none;
    padding: 0px;

    &:hover {
        cursor: pointer;
        color: rgb(255,255,255);
    }
    &:focus {
        outline: none;
    }

    & i {
        font-size: 35px;
    }
`;

const PrevSong = styled.button`
    height: 30px;
    color: rgba(255,255,255,0.75);
    font-size: 18px;
    background: none;
    border: none;
    outline: none;
    margin: 10px 0px;
    padding: 0px;

    &:hover {
        cursor: pointer;
        color: rgb(255,255,255);
    }
    &:focus {
        outline: none;
    }

    &:disabled {
        color: rgb(75, 75, 75);
        cursor: default;
    }
`;
const NextSong = styled.button`
    height: 30px;
    color: rgba(255,255,255,0.75);
    font-size: 18px;
    background: none;
    border: none;
    outline: none;
    margin: 10px 0px;
    padding: 0px;

    &:hover {
        cursor: pointer;
        color: rgb(255,255,255);
    }
    &:focus {
        outline: none;
    }

    &:disabled {
        color: rgb(75, 75, 75);
        cursor: default;
    }
`;
const SideControlsWrapper = styled.div`
    display: inline-block;
    width: 100%;
    height: 50px;
`;

class PlaybackControls extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    // toggle play/pause status
    handlePlayPause = async () => {
        try {
            const { isPlaying } = this.props.playback
            if (isPlaying) { updateState({ isPlaying: false }) }
            else if (!isPlaying) { updateState({ isPlaying: true}) }
            await togglePlay();
        } catch (error) {
            console.error(error);
        }
    }
    // skip to previous track
    handlePrev = async () => {
        try {
            let isExternal = await isExternalPlayer()
            if (isExternal) {
                const { authToken } = this.props;

                await skipPrev(authToken);

                this.setState({
                    syncTimeout: window.setTimeout(() => {
                        syncDevice();
                    }, 300)
                })
            } else if (this.props.player) {
                await this.props.player.previousTrack();
            }
        } catch (error) {
            console.error(error);
        }
    }
    // skip to next track
    handleNext = async () => {
        try {
            let isExternal = await isExternalPlayer()
            if (isExternal) {
                const { authToken } = this.props;

                await skipNext(authToken);

                this.setState({
                    syncTimeout: window.setTimeout(() => {
                        syncDevice();
                    }, 300)
                })
            } else if (this.props.player) {
                await this.props.player.nextTrack();
            }
        } catch (error) {
            console.error(error);
        }
    }
    render() {
        return (
            <Fragment>
                {this.props.playback.isMounted ?
                <Fragment>
                    <PrevSong onClick={this.handlePrev} disabled={this.props.playback.prevTracks.length < 1 } >
                        <SkipPrevious style={{fontSize:"25px", verticalAlign:"middle"}} />
                    </PrevSong>
                    <PlayPauseButton onClick={this.handlePlayPause} >
                        {this.props.playback.isPlaying
                            ? <PauseCircleOutline style={{fontSize:"40px", verticalAlign:"middle"}} />
                            : <PlayCircleOutline style={{fontSize:"40px", verticalAlign:"middle"}} />
                        }
                    </PlayPauseButton>
                    <NextSong onClick={this.handleNext} disabled={this.props.playback.nextTracks.length < 1 } >
                        <SkipNext style={{fontSize:"25px", verticalAlign:"middle"}} />
                    </NextSong>
                    
                    <SideControlsWrapper>
                        <VolumeControls authToken={this.props.authToken} />
                        <ShuffleRepeatControls authToken={this.props.authToken} ></ShuffleRepeatControls>
                    </SideControlsWrapper>
                </Fragment>
                : null }
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        playback: state.plbk.playback,
        player: state.play.player,
    };
};

export default connect(mapStateToProps, null)(PlaybackControls)