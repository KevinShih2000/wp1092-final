import { Switch, Route } from 'react-router-dom';

import './App.css';

import MainPage from './components/MainPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';

function App() {
    return (
        <Switch>
            <Route path="/signup">
                <SignupPage />
            </Route>
            <Route path="/login">
                <LoginPage />
            </Route>
            <Route path="/">
                <MainPage />
            </Route>
        </Switch>
    );
}

export default App;
