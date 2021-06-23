import { useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import './App.css';

import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    return (
        <Switch>
            <Route path="/signup">
                <SignupPage />
            </Route>
            <Route path="/login">
                <LoginPage setIsLoggedIn={ setIsLoggedIn } setLoginUsername={ setUsername } />
            </Route>
            <Route path="/">
            {
                isLoggedIn
                ? <MainPage
                    setIsLoggedIn={ setIsLoggedIn }
                    username={ username }
                    setUsername={ setUsername }
                />
                : <LandingPage />
            }
            </Route>
        </Switch>
    );
}

export default App;
