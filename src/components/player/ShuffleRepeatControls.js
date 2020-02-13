import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { Repeat, RepeatOne, Shuffle
    } from '@material-ui/icons';

import { setShuffle, setRepeat } from '../../utils/spotify/player';
import { updateState } from '../../utils/spotify/playback';

const ControlsWrapper = styled.div`
    display: block;
    width: 110px;
    height: 24px;
    text-align: center;
`;
const ButtonWrapper = styled.div`
    display: inline-block;
    width: 55px;
    height: 24px;
    vertical-align: middle;
    box-sizing: border-box;
`;
const IconButton = styled.button`
    height: 22px;
    width: 22px;
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

class ShuffleRepeatControls extends Component {
    constructor(props) {
        super(props)
        this.state = {
            shuffle: this.props.playback.shuffle,
            repeat_mode: this.props.playback.repeat_mode,
        }
    }
    componentDidUpdate(prevProps) {
        if(prevProps.playback.shuffle !== this.props.playback.shuffle) {
            this.setState({ shuffle: this.props.playback.shuffle })
        }
        if(prevProps.playback.repeat_mode !== this.props.playback.repeat_mode) {
            this.setState({ repeat_mode: this.props.playback.repeat_mode })
        }
    }
    handleShuffle = async () => {
        const { authToken } = this.props;
        let { shuffle } = this.state;
        let newState = false;

        if (!shuffle) { newState = true }

        let response = await setShuffle(authToken, newState)
        if (response.status === 204) { 
            updateState({ shuffle: newState })
        } else ( console.error('Unable to set shuffle state. Make sure there is an active device.') )
    }
    handleRepeat = async () => {
        const { authToken } = this.props;
        const { repeat_mode } = this.state;
        let newState = 0;

        if (repeat_mode === 0) { newState = 1 }
        else if (repeat_mode === 1) { newState = 2 }

        let response = await setRepeat(authToken, newState)
        if (response.status === 204) { 
            updateState({ repeat_mode: newState })
        } else ( console.error('Unable to set repeat state. Make sure there is an active device.') )
    }
    render() {
        return (
            <ControlsWrapper>
                <ButtonWrapper>
                    <IconButton onClick={this.handleShuffle}>
                        <Shuffle style={{color:this.state.shuffle ? '#1db954' : 'white', fontSize:'22px'}}></Shuffle>
                    </IconButton>
                </ButtonWrapper>
                <ButtonWrapper>
                    <IconButton onClick={this.handleRepeat}>
                        {this.state.repeat_mode === 0 || this.state.repeat_mode === 1
                        ? <Fragment>
                            { this.state.repeat_mode === 0
                            ? <Repeat style={{color:'white', fontSize:'22px'}}></Repeat>
                            : <Repeat style={{color:'#1db954', fontSize:'22px'}}></Repeat>
                            }
                          </Fragment>
                        : <RepeatOne style={{color:'#1db954', fontSize:'22px'}}></RepeatOne>
                        }
                    </IconButton>
                </ButtonWrapper>
            </ControlsWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        player: state.play.player,
        playback: state.plbk.playback,
    };
};

export default connect(mapStateToProps, null)(ShuffleRepeatControls)