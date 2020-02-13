import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { withStyles } from '@material-ui/core/styles';
import { PlayCircleOutline } from '@material-ui/icons';

import PlayButton from './PlayButton'

const StyledPlayIcon = withStyles({
    root: {
        fontSize: '50px',
        transition: 'all .2s',
        '&:hover': {
           fontSize: '58px',
           cursor: 'pointer',
        },
    },
})(PlayCircleOutline)

const UserLibraryWrapper = styled.div`
    display: inline-block;
    height: 250px;
    width: 415px;
    background-color: #282828;
    padding: 10px 10px 11px 10px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;

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

// Track List/Table elements are for Recent, Liked, and Playlist tracks
const TrackListTitle = styled.div`
    display: inline-block;
    width: 300px;
    height: 32px;
    vertical-align: middle;
    font-size: 25px;
    font-family: 'Proxima Bold', 'Montserrat';
    padding-left: 10px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const TrackTable = styled.table`
    width: 395px;
    margin-top: 25px;
    box-sizing: border-box;
    border-collapse: collapse;
`;
const TrackTableHead = styled.thead`
    font-family: 'Proxima Thin', Georgia, sans-serif;
    font-size: 12px;
`;
const TrackTableHeadData = styled.th`
    width: ${props => props.width};
    max-width: ${props => props.width};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    font-weight: 400;
    border-bottom: 1px solid #666;
`;
const TrackTableRow = styled.tr`
    font-family: 'Proxima Nova', Georgia, sans-serif;
    font-size: 14px;

    &:hover {
        background-color: hsla(0,0%,100%,.1);
    }
`;
const TrackTableRowData = styled.td`
    width: ${props => props.width};
    max-width: ${props => props.width};
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    border-bottom: 1px solid #666;
    padding: 8px 5px 8px 2px;
`;

// Item Block elements are used for albums and artists
const ItemBlock = styled.div`
    width: 125px;
    min-height: 155px;
    display: inline-block;
    background-color: black;
    box-sizing: border-box;
    vertical-align: middle;
    margin-right: 7px;
    margin-bottom: 7px;
    border-radius: 10px;

    &:nth-child(3n+3) {
        margin-right: 0px;
    }
`;
const ItemBlockWrapper = styled.div`
    display: block;
    width: 100%;
    height: 100%;
`;
const ItemOverlay = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: .5s ease;
    background-color: rgba(0, 0, 0, 0.4);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
`;
const ItemOverlayContex = styled.div`
    color: white;
    font-size: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
`;
const ItemBlockImage = styled.div`
    position: relative;
    display: block;
    width: 100%;
    height: 125px;
    box-sizing: border-box;
    background: url('${props => props.image}') no-repeat center center; 
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;

    &:hover {
        cursor: default;
    }
    &:hover ${ItemOverlay} {
        opacity: 1;
    }
`;
const ItemBlockName = styled.div`
    display: block;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    padding: 5px 8px 0px 8px;
    font-size: 2vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
`;
const ItemBlockArtist = styled.div`
    display: block;
    width: 100%;
    height: 25px;
    box-sizing: border-box;
    padding: 5px 8px 5px 8px;
    font-size: 1.8vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const ImageWrapper = styled.div`
    width: 390px;
    height: 225px;
    text-align: center;
    font-size: 30px;
    box-sizing: border-box;
    display: inline-block;
    position: relative;
    line-height: 225px;
`;
const Greeting = styled.p`
    display: inline-block;
    vertical-align: middle;
    padding: 0px 28px;
    line-height: 115%;
`;

class UserLibrary extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        const { type, data, tracks } = this.props.display
        return (
            <UserLibraryWrapper>
                {this.props.loaded && type !== null && typeof type !== 'undefined'
                ? <Fragment>
                    {type === 'recent' || type === 'tracks' || type === 'playlist'
                    ? <Fragment>
                        <PlayButton width={'85px'} padding={'10px 6px'}
                            data-type={type}
                            data-tracks={type === 'recent' || type === 'tracks' ? JSON.stringify(this.props.display.tracks) : null}
                            data-uri={type === 'playlist' ? this.props.display.uri : null}
                            onClick={this.props.handlePlaySet} >
                            PLAY
                        </PlayButton>
                        <TrackListTitle>{this.props.display.name}</TrackListTitle>

                        <TrackTable>
                            <TrackTableHead>
                                <tr>
                                    <TrackTableHeadData width={'200px'}>TITLE</TrackTableHeadData>
                                    <TrackTableHeadData width={'95px'}>ARTIST</TrackTableHeadData>
                                    <TrackTableHeadData width={'95px'}>ALBUM</TrackTableHeadData>
                                </tr>
                            </TrackTableHead>
                            <tbody>
                                {Object.keys(tracks).map((item, i) => {
                                    return (
                                        <TrackTableRow key={i}>
                                            <TrackTableRowData width={'200px'}>{tracks[item].name}</TrackTableRowData>
                                            <TrackTableRowData width={'95px'}>{tracks[item].artists[0].name}</TrackTableRowData>
                                            <TrackTableRowData width={'95px'}>{tracks[item].album.name}</TrackTableRowData>
                                        </TrackTableRow>
                                    )
                                })}
                            </tbody>
                        </TrackTable>
                      </Fragment>
                    : <Fragment>
                        {Object.keys(data).map((item, i) => {
                            if (type === 'albums') {
                                return (
                                    <ItemBlock key={i}>
                                        <ItemBlockWrapper>
                                            <ItemBlockImage image={data[item].images[0].url}>
                                                <ItemOverlay><ItemOverlayContex>
                                                    <StyledPlayIcon data-type={'album'} data-uri={data[item].uri} onClick={this.props.handlePlaySet} />
                                                </ItemOverlayContex></ItemOverlay>
                                            </ItemBlockImage>
                                            <ItemBlockName>{data[item].name}</ItemBlockName>
                                            <ItemBlockArtist>{data[item].artists[0].name}</ItemBlockArtist>
                                        </ItemBlockWrapper>
                                    </ItemBlock>
                                )
                            } else if (type === 'artists') {
                                return (
                                    <ItemBlock key={i}>
                                        <ItemBlockWrapper>
                                            <ItemBlockImage image={data[item].images[0].url}>
                                                <ItemOverlay><ItemOverlayContex>
                                                    <StyledPlayIcon data-type={'artist'} data-uri={data[item].uri} onClick={this.props.handlePlaySet} />
                                                </ItemOverlayContex></ItemOverlay>
                                            </ItemBlockImage>
                                            <ItemBlockName>{data[item].name}</ItemBlockName>
                                        </ItemBlockWrapper>
                                    </ItemBlock>
                                )
                            } else {
                                return ( null )
                            }
                        })}
                      </Fragment>
                    }
                    
                </Fragment>
                : <Fragment>
                    <ImageWrapper>
                        <Greeting>Welcome to SpotLite</Greeting>
                    </ImageWrapper>
                </Fragment>
                }
            </UserLibraryWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.a.user
    };
};

export default connect(mapStateToProps, null)(UserLibrary)