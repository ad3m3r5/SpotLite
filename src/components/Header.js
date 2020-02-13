import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import SpotifyLogin from './auth/SpotifyLogin'
import SpotifyLogout from './auth/SpotifyLogout'
import PlaybackControls from './player/PlaybackControls'
import PlaybackDetails from './player/PlaybackDetails'

const HeaderWrapper = styled.div`
    width: 600px;
    height: 50px;
    background-color: black;
    color: white;
    display: flex;
`;
const ButtonWrapper = styled.div`
    width: 200px;
    height: 50px;
    display: inline-block;
    padding: 7px 8px;
    box-sizing: border-box;
    text-align: center;
`;
const ControlsWrapper = styled.div`
    width: 200px;
    height: 50px;
    padding: 0px 8px;
    display: flex;
    vertical-align: middle;
    border-left: 1px solid white;
    border-right: 1px solid white;
    align-items: middle;
`;

const DetailsWrapper = styled.div`
    width: 182px;
    height: 50px;
    display: inline-block;
    box-sizing: border-box;
    padding: 2px 5px;
    vertical-align: middle;
`;

class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidUpdate(prevProps) {
    }
    render() {
        return (
            <HeaderWrapper>
                {this.props.user !== null && this.props.isAuth
                ? <Fragment>
                    {this.props.user && this.props.user.profile.product === "premium"
                        ? <Fragment>
                            <ButtonWrapper>
                                <SpotifyLogout onLogout={this.props.onLogout} />
                            </ButtonWrapper>
                            {this.props.playback.isMounted && this.props.playback.track.id
                            ? <Fragment>
                                <ControlsWrapper>
                                    <PlaybackControls isAuth={this.props.isAuth} authToken={this.props.user.auth.access_token} />
                                </ControlsWrapper>
                                <DetailsWrapper>
                                    <PlaybackDetails isAuth={this.props.isAuth} authToken={this.props.user.auth.access_token} />
                                </DetailsWrapper>
                              </Fragment>
                            : null
                            }
                          </Fragment>
                        : <Fragment>
                            <ButtonWrapper>
                                <SpotifyLogout onLogout={this.props.onLogout} />
                            </ButtonWrapper>
                          </Fragment>
                    }
                  </Fragment>
                : <Fragment>
                    <ButtonWrapper>
                        <SpotifyLogin />
                    </ButtonWrapper>
                  </Fragment>
                }
            </HeaderWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.a.user,
        playback: state.plbk.playback
    };
};

export default connect(mapStateToProps, null)(Header)