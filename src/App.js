import React, { Component } from 'react'
import './App.css';
import { connect } from 'react-redux';
import { auth } from './redux/actions';

import { getTokenRefresh } from './utils/spotify/auth';

import Titlebar from './components/Titlebar'
import Header from './components/Header'
import Page from './components/Page'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isAuth: false,
        }
    }
    componentDidMount() {
        sessionStorage.removeItem('device_id')

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
        } else {
            this.handleLogout()
        }
    }
    render() {
        return (
            <div className="App">
                <Titlebar />
                <Header
                    onLogout={this.handleLogout}
                    isAuth={this.state.isAuth}
                />
                <Page
                    isAuth={this.state.isAuth}
                />
            </div>
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