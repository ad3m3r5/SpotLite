/*
    AN IMPLEMENTATION OF https://github.com/int64ago/react-scroll-text
    WITH NECESSARY CHANGES FOR THIS PROJECT
*/

import React from 'react'
import styled from 'styled-components'

export default class ScrollText extends React.Component {
    static defaultProps = {
        speed: 100,
        text: '',
    }

    handleDurationUpdate = () => {
        if (this.textRef && (
            this.state.clientWidth !== this.textRef.clientWidth ||
            this.state.scrollWidth !== this.textRef.scrollWidth
        )) {
            this.setState({
                clientWidth: this.textRef.clientWidth,
                scrollWidth: this.textRef.scrollWidth,
                duration: (this.textRef.clientWidth + this.textRef.scrollWidth) / this.props.speed
            })
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            clientWidth: 0,
            scrollWidth: 0,
            duration: 5
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if ( this.state.clientWidth !== nextState.clientWidth ||
             this.state.scrollWidth !== nextState.scrollWidth ||
             this.state.duration !== nextState.duration) {
            return true
        }
        if (this.props.text !== nextProps.text) {
            return true
        }
        else {
            return false
        }
    }

    componentDidMount() {
        this.handleDurationUpdate()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.text !== this.props.text) {
            this.handleDurationUpdate()
        }
    }

    render() {
        const {
            clientWidth,
            scrollWidth,
            duration
        } = this.state

        const Container = styled.div`
            overflow: hidden;
            word-break: keep-all;
            white-space: nowrap;
            width: 100%;
        `;

        const ScrollText = styled.div`
            animation: ${scrollWidth > clientWidth ? `scroll ${duration}s linear infinite` : 'none'};
            animation-fill-mode: forwards;
            animation-play-state: running;
            -webkit-animation-play-state: running;

            @keyframes scroll {
                0% {
                    transform: translateX(${clientWidth}px);
                }
                100% {
                    transform: translateX(-${scrollWidth}px);
                }
            }

            &:hover {
                animation-play-state: paused;
                -webkit-animation-play-state: paused;
            }
        `;

        return (
            <Container {...this.props}>
                <ScrollText ref={e => { this.textRef = e }}>
                    {this.props.text}
                </ScrollText>
            </Container>
        )
    }
}