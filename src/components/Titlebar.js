import React, { Component } from 'react';
import styled from 'styled-components';
const { remote } = window.require('electron')

const TitleBarWrapper = styled.div`
    display: block;
    width: 600px;
    height: 25px;
    background: black;
    color: white;
    //color: rgb(29, 185, 84);
    //border-bottom: 1px solid rgb(29, 185, 84);
    -webkit-app-region: drag;
`;
const TitleWrapper = styled.div`
    height: 25px;
    line-height: 25px;
    float: left;
    padding-left: 10px;
    font-family: 'Proxima Thin', Georgia, sans-serif;
`;
const ControlsWrapper = styled.div`
    -webkit-app-region: no-drag;
    height: 25px;
    float: right;
`;
const CloseButton = styled.div`
    width: 30px;
    height: 25px;
    display: inline-block;
    text-align: center;
    vertical-align: top;
    font-size: 14px;
    line-height: 25px;

    &:hover {
        background-color: #DC143C;
    }
`;
const MinimizeButton = styled.div`
    width: 30px;
    height: 25px;
    display: inline-block;
    text-align: center;
    vertical-align: top;
    line-height: 25px;

    &:hover {
        background-color: rgba(220, 220, 220, 0.2);
    }
`;

class Titlebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    handleMinimize = () => {
        remote.getCurrentWindow().minimize();
    }
    handleClose = () => {
        remote.getCurrentWindow().close();
    }
    render() {
        return (
            <TitleBarWrapper>
                <TitleWrapper>SpotLite</TitleWrapper>
                <ControlsWrapper>
                    <MinimizeButton onClick={this.handleMinimize}>&ndash;</MinimizeButton>
                    <CloseButton onClick={this.handleClose}>&#x2715;</CloseButton>
                </ControlsWrapper>
            </TitleBarWrapper>
        )
    }
}

export default Titlebar