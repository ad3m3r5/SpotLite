import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import { VolumeUp, VolumeDown, VolumeOff
    } from '@material-ui/icons';
import { Slider, Tooltip } from '@material-ui/core';

import { updateState, isExternalPlayer, syncDevice } from '../../utils/spotify/playback';
import { setVolume } from '../../utils/spotify/player';

const StyledSlider = withStyles({
    thumb: {
        backgroundColor: '#1db954',
        border: '2px solid #1db954',
        '&$focused, &:hover': {
            boxShadow: `0px 0px 0px 6px rgba(29, 185, 84, 0.25)`,
        },
        '&$activated': {
            boxShadow: `0px 0px 0px 10px rgba(29, 185, 84, 0.25)`,
        },
        '&$jumped': {
            boxShadow: `0px 0px 0px 10px rgba(29, 185, 84, 0.25)`,
        },
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
    return (
        <StyledTooltip open={open} enterTouchDelay={0} placement="top" title={Math.round(value)}>
            {children}
        </StyledTooltip>
    );
}

const VolumeWrapper = styled.div`
    display: block;
    width: 110px;
    height: 26px;
`;
const VolumeInfo = styled.div`
    display: inline-block;
    height: 26px;
    width: 35px;
    vertical-align: top;
    padding: 1px 5px;
    box-sizing: border-box;
`;
const MuteButton = styled.button`
    height: 25px;
    width: 25px;
    background: none;
    outline: none;
    border: none;
    color: rgba(255,255,255,0.75);
    padding: 0px;

    &:hover {
        cursor: pointer;
        color: rgb(255,255,255);
    }
    &:focus {
        outline: none;
    }
`;
const SliderWrapper = styled.div`
    display: inline-block;
    width: 75px;
    height: 26px;
    padding: 2px 8px 2px 6px;
    box-sizing: border-box;
    vertical-align: top;
    line-height: 20px;
`;

class VolumeControls extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timeout: undefined,
            volume: this.props.playback.volume,
        }
    }
    componentDidUpdate(prevProps) {
        if(prevProps.playback.volume !== this.props.playback.volume) {
            this.setState({ volume: this.props.playback.volume })
        }
    }
    // handle volume slider
    handleVolumeSlider = async (event, newVolume) => {
        clearTimeout(this.state.timeout)

        this.setState({ volume: newVolume,
            timeout: window.setTimeout(() => {
                this.setVolume(newVolume);
            }, 250)
        })
    }
    // set new volume
    setVolume = async (newVolume) => {
        const { authToken } = this.props;
        let valid = false;
        let isExternal = await isExternalPlayer()

        if (isExternal) {
            let response = await setVolume(authToken, newVolume);
            if(response && response.status === 204) {
                await syncDevice();
            } else { valid = false }
        } else if (this.props.player) {
            await this.props.player.setVolume(newVolume/100);
        }
        if (valid) { updateState({ newVolume }) }
    }
    // handle volume mute/unmute
    handleMute = async () => {
        clearTimeout(this.state.timeout)
        let oldVolume = this.state.volume

        let newVolume = 0;
        if (oldVolume === 0) {
            newVolume = 75;
        }
        
        this.setState({ volume: newVolume,
            timeout: window.setTimeout(() => {
                this.setVolume(newVolume);
            }, 250)
        })
    }
    render() {
        return (
            <VolumeWrapper>
                <VolumeInfo>
                    <MuteButton onClick={this.handleMute}>
                        {this.state.volume > 40
                            ? <VolumeUp style={{fontSize:"25px"}} />
                            : <Fragment>
                                {this.state.volume !== 0
                                ? <VolumeDown style={{fontSize:"25px"}} />
                                : <VolumeOff style={{fontSize:"25px"}} />
                                }
                            </Fragment>
                        }
                    </MuteButton>
                </VolumeInfo>
                <SliderWrapper>
                    <StyledSlider
                        value={this.state.volume}
                        onChange={this.handleVolumeSlider}
                        aria-labelledby="volume-slider"
                        style={{
                            color:"#1db954",
                            display:"inline-block",
                            verticalAlign:"middle",
                            padding:"10px 0px",
                        }}
                        ValueLabelComponent={ValueLabelComponent}
                        step={5}
                        min={0}
                        max={100}
                    />
                </SliderWrapper>
            </VolumeWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        player: state.play.player,
        playback: state.plbk.playback,
    };
};

export default connect(mapStateToProps, null)(VolumeControls)