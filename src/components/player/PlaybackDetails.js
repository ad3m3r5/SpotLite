import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { store } from '../../redux/store'

import { withStyles } from '@material-ui/core/styles';
import { Slider, Tooltip } from '@material-ui/core';

import { updateState, isExternalPlayer } from '../../utils/spotify/playback';
import { seek } from '../../utils/spotify/player';

import ScrollText from './ScrollingText'

const TrackInfo = styled.div`
    width: 172px;
    height: 20px;
    min-height: 20px;
    box-sizing: border-box;
    padding: 0px 8px;
    font-size: 12px;
    line-height: 20px;
`;

const TextScrollWrapper = styled.div`
    overflow: hidden;
    word-break: keep-all;
    white-space: nowrap;
    width: 100%;
`;

const SeekSlider = styled.div`
    width: 172px;
    height: 30px;
    box-sizing: border-box;
    padding: 0px 8px;
`;

const StyledSlider = withStyles({
    root: {

    },
    thumb: {
        height: 8,
        width: 8,
        marginTop: -3,
        backgroundColor: 'white',
        border: '1px solid #1db954',
        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit',
          },
    },
    active: {},
    valueLabel: {},
    track: {
        height: 2,
        borderRadius: 3,
    },
    rail: {
        height: 2,
        opacity: 0.5,
        backgroundColor: 'lightgrey',
    },
    mark: {
        backgroundColor: '#bfbfbf',
        height: 2,
        width: 1,
        marginTop: -3,
    },
    markActive: {
        opacity: 1,
        backgroundColor: 'currentColor',
    },
})(Slider)

const StyledTooltip = withStyles({
    tooltip: {
        color: 'white',
        backgroundColor: 'rgba(23, 23, 23, 1)',
        fontSize: '14px'
    }
})(Tooltip)

function ValueLabelComponent(props) {
    const { children, open, value } = props;
    const { playback } = store.getState().plbk;

    const position = ((value / 100) * playback.track.duration)

    const minutes = Math.floor(position / 60000);
    const seconds = ((position % 60000) / 1000).toFixed(0);
    const format = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

    return (
        <StyledTooltip open={open} enterTouchDelay={0} placement="top" title={format}>
            {children}
        </StyledTooltip>
    );
}

class PlaybackDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            position: this.props.playback.position,
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.playback.position !== this.props.playback.position) {
            this.setState({ position: this.props.playback.position })
        }
    }
    // handle slider for track seek
    handleSeekSlider = async (event, position) => {
        this.seekTrack(position)
    }
    // Change seek position
    seekTrack = async (position) => {
        const { track } = this.props.playback;
        const { authToken } = this.props;

        try {
            const percentage = position / 100;
            let isExternal = await isExternalPlayer()
            if (isExternal) {
                await seek(Math.round(track.duration * percentage), authToken);

                updateState({ position, progress: Math.round(track.duration * percentage) });
                this.setState({ position })
            } else if (this.props.player) {
                const state = (await this.props.player.getCurrentState());

                if (state) {
                    await this.props.player.seek(
                        Math.round(state.track_window.current_track.duration_ms * percentage),
                    );
                } else {
                    updateState({ position: 0 });
                    this.setState({ position: 0 })
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
    render() {
        const trackName = (this.props.playback.track.name + ' - ' + this.props.playback.track.artists).toString()
        
        return (
            <Fragment>
                {this.props.playback.track.id
                ? <Fragment>
                    <TrackInfo>
                        <TextScrollWrapper>
                            <ScrollText speed={40} text={trackName} />
                        </TextScrollWrapper>
                    </TrackInfo>
                    <SeekSlider>
                        <StyledSlider
                            value={this.state.position}
                            onChange={this.handleSeekSlider}
                            aria-labelledby="seek-slider"
                            style={{
                                color:"#1db954",
                                display:"inline-block",
                                verticalAlign:"middle",
                                padding:"10px 0px",
                            }}
                            ValueLabelComponent={ValueLabelComponent}
                            duration={this.props.playback.track.duration}
                            min={0}
                            max={100}
                            step={.1}
                        />
                    </SeekSlider>
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

export default connect(mapStateToProps, null)(PlaybackDetails)