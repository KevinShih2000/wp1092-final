import { useState } from 'react';

import './App.css';

import Signin from './components/Signin';
import MainPage from './components/MainPage';

function App() {
    const [alreadySignedIn, setAlreadySignedIn] = useState(false);
    return (
        <div>
            <MainPage />
        </div>
    );
}

export default App;
