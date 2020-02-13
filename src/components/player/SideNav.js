import React, { Component, Fragment } from 'react';
import styled from 'styled-components';

import { LibraryBooks, PlaylistPlay } from '@material-ui/icons';

const SideNavWrapper = styled.div`
    display: inline-block;
    height: 250px;
    width: 185px;
    background-color: black;
    padding: 5px 6px 20px 6px;
    box-sizing: border-box;
    overflow-y: auto;

    &::-webkit-scrollbar {
        height: 1px;
        width: 5px;
        background: #000;
    }
    &::-webkit-scrollbar-thumb {
        background: rgb(30, 215, 96);
        -webkit-border-radius: 1ex;
        -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
    }
    &::-webkit-scrollbar-corner {
        background: #000;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-track-piece:end {
        background: transparent;
        margin-bottom: 0px; 
    }
    &::-webkit-scrollbar-track-piece:start {
        background: transparent;
        margin-top: 0px;
    }
`;

const TitleBlock = styled.nav`
    width: 100%;
    display: block;
`;

const ListTitle = styled.div`
    display: inline-block;
    font-size: 18px;
    letter-spacing: 2px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    margin: 2px 0px;
`;

const ListName = styled.div`
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    padding-top: 2px;
    padding-left: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        color: rgb(255,255,255);
        cursor: pointer;
    }
`;

class SideNav extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <SideNavWrapper>
                {this.props.loaded
                ? <TitleBlock><LibraryBooks style={{verticalAlign:"middle",marginRight:"4px",marginLeft:"3px",fontSize:"17px"}} /><ListTitle>Library</ListTitle></TitleBlock>
                : null }
                {this.props.library !== null
                ? <Fragment>
                    {this.props.library.recent.length > 0 ?
                        <ListName data-type={'recent'} onClick={this.props.handleChangeDisplay.bind(this)} >Recently Played</ListName>
                    : null }
                    {this.props.library.tracks.length > 0 ?
                        <ListName data-type={'tracks'} onClick={this.props.handleChangeDisplay.bind(this)} >Liked Songs</ListName>
                    : null }
                    {this.props.library.albums.length > 0 ? 
                        <ListName data-type={'albums'} onClick={this.props.handleChangeDisplay.bind(this)} >Albums</ListName>
                    : null }
                    {this.props.library.artists.length > 0 ?
                        <ListName data-type={'artists'} onClick={this.props.handleChangeDisplay.bind(this)} >Artists</ListName>
                    : null }

                    {this.props.library.playlists.length > 0
                    ? <Fragment>
                        <TitleBlock><PlaylistPlay style={{verticalAlign:"middle",marginRight:"0px",fontSize:"22px"}} /><ListTitle>Playlists</ListTitle></TitleBlock>
                        {Object.keys(this.props.library.playlists).map((item, i) => {
                            return (
                                <ListName key={i} 
                                    data-type={'playlist'}
                                    data-name={this.props.library.playlists[item].name}
                                    data-uri={this.props.library.playlists[item].uri}
                                    onClick={this.props.handleChangeDisplay.bind(this)}
                                >
                                    {this.props.library.playlists[item].name}
                                </ListName>
                            )
                        })}
                    </Fragment>
                    : null
                    }
                  </Fragment>
                : null }
            </SideNavWrapper>
        )
    }
}

export default (SideNav)