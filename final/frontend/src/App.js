import { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import axios from 'axios';

import './App.css';

import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(async () => {
        try {
            const result = await instance.post('/sessionLogin', null, { withCredentials: true });
            const data = result.data;
            if (data.status === 'success') {
                setUsername(data.username);
                setIsLoggedIn(true);
            }
        }
        catch (error) {  }
    }, []);

    return (
        <>
        {
            isLoggedIn
            ? <Switch>
                <Route exact path='/'>
                    <Redirect to='/home' />
                </Route>
                <Route path={ ['/home', '/chat', '/room'] }>
                    <MainPage setIsLoggedIn={ setIsLoggedIn } username={ username } setUsername={ setUsername } />
                </Route>
                <Route path='/'>
                    <Redirect to='/home' />
                </Route>
            </Switch>
            : <Switch>
                <Route exact path='/'>
                    <LandingPage />
                </Route>
                <Route exact path='/signup'>
                    <SignupPage />
                </Route>
                <Route exact path='/login'>
                    <LoginPage setIsLoggedIn={ setIsLoggedIn } setLoginUsername={ setUsername } />
                </Route>
                <Route path='/'>
                    <Redirect to='/' />
                </Route>
            </Switch>
        }
        </>
    );
}

export default App;
