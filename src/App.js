import React, { Component, Fragment } from 'react'
import './App.css';
import { connect } from 'react-redux';
import { auth } from './redux/actions';

import { getTokenRefresh } from './utils/spotify/auth';

import Header from './components/Header'
import Page from './components/Page'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isAuth: false,
            popupAllowed: true,
        }
    }
    componentDidMount() {
        this.popout()
        localStorage.removeItem('device_id')

        this.interval = setInterval(() => {
            this.handleShouldRefresh();
        }, 1500000) // refresh token every 25 minutes (normal expiration is 60min)

        this.handleShouldRefresh();
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.user !== this.props.user) {
            this.handleShouldRefresh()
        }
    }
    handleLogout = () => {
        this.setState({ isAuth: false })
        this.props.auth(null)
    }
    handleShouldRefresh = () => {
        if (typeof this.props.user !== 'undefined' && this.props.user !== null) {
            this.setState({ isAuth: true })
            let diffTime = (new Date()).getTime() - this.props.user.auth.tokenTime
            if (diffTime > 1800000) { // refresh token after 30 min
                getTokenRefresh(this.props.user).then((newToken) => {
                    let tempUser = this.props.user
                    tempUser.auth.access_token = newToken
                    tempUser.auth.tokenTime = (new Date()).getTime()
                    this.props.auth(tempUser)
                    window.location.reload();
                })
            }
        }
    }
    popout = async () => {
        const { innerWidth, innerHeight, name } = window
        const { href } = window.location
        let tooSmall = (innerWidth < 595 || innerHeight < 295)
        let tooLarge = (innerWidth > 605 || innerHeight > 305)

        // if the window is the spotify popup callback
        if (name === 'spotify-login') {
            return
        } else {
            // if the window is tooSmall or tooLarge for the application
            if (tooSmall || tooLarge) {
                let SpotLite = window.open(href, "SpotLite", "width=600, height=300")
                if (!SpotLite || SpotLite.closed || typeof SpotLite.closed=='undefined') {
                    this.setState({ popupAllowed: false })
                    alert('Please enable popup windows')
                } else {
                    window.open("https://www.spotify.com/", "_self")
                    SpotLite.focus()
                }
            }
        }
    }
    render() {
        return (
            <Fragment>
                {this.state.popupAllowed
                ? <div className="App">
                    <Header
                        onLogout={this.handleLogout}
                        isAuth={this.state.isAuth}
                    />
                    <Page
                        isAuth={this.state.isAuth}
                    />
                  </div>
                : <div className="popup-not-allowed">
                    <div>
                        <div style={{textAlign:'center'}}>Please enable popup windows</div>
                        <div style={{textAlign:'center'}}>and then refresh</div>
                    </div>
                  </div>
                }
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.a.user,
    };
};

const mapDispatchToProps = {
    auth,
};

export default connect(mapStateToProps, mapDispatchToProps)(App)