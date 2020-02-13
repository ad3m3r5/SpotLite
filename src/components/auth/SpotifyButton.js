import React, { Component } from 'react';
import styled from 'styled-components';

class SpotifyButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    
    render() {
        const { width, padding } = this.props;

        const SpotButton = styled.button`
            width: ${width};
            box-sizing: border-box;
            text-decoration: none !important;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            line-height: 1;
            text-align: center;
            text-transform: uppercase;
            touch-action: manipulation;
            transition-duration: 33ms;
            transition-property: background-color, border-color, color, box-shadow, filter, transform;
            user-select: none;
            transform: translate3d(0px, 0px, 0px);
            background-color: rgb(29, 185, 84);
            color: rgb(255, 255, 255);
            border-width: 0px;
            border-style: initial;
            border-color: initial;
            border-image: initial;
            border-radius: 25px;
            padding: ${padding};
            outline: none;

            &:hover:not(:active) {
                transform: scale(1.04);
                background-color: rgb(30, 215, 96);
                color: rgb(255, 255, 255);
            }
            &:active {
                color: rgb(238, 238, 238);
                background-color: rgb(20, 131, 59);
            }
        `;
        return (
            <SpotButton onClick={this.props.handleClick} >
                {this.props.children}
            </SpotButton>
        )
    }
}
export default SpotifyButton