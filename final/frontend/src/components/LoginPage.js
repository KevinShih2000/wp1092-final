import { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import LockIcon from '@material-ui/icons/Lock';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import MuiAlert from '@material-ui/lab/Alert';

import { Link as RouterLink, Redirect } from 'react-router-dom';
import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.dark,
        height: '5em',
        width: '5em'
    },
    title: {
        marginTop: theme.spacing(1)
    },
    loginIcon: {
        fontSize: '3em'
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    progress: {
        marginTop: theme.spacing(2)
    }
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function LoginPage(props) {
    const classes = useStyles();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [showCircularProgress, setShowCircularProgress] = useState(false);
    const [showLoginSuccess, setShowLoginSuccess] = useState(false);
    const [showLoginError, setShowLoginError] = useState(false);
    const [redirectToMainPage, setRedirectToMainPage] = useState(false);

    const [loginErrorMessage, setLoginErrorMessage] = useState('');

    const setIsLoggedIn = props.setIsLoggedIn;
    const setLoginUsername = props.setLoginUsername;

    const avatar = props.avatar;
    const setAvatar = props.setAvatar;

    function handleCloseLoginSuccessMessage() {
        setIsLoggedIn(true);
        setRedirectToMainPage(true);
    }

    function handleCloseErrorMessage() {
        setShowLoginError(false);
        setLoginErrorMessage('');
    }

    async function loginAndRedirectToMainPage(event) {
        event.preventDefault();

        try {
            setShowCircularProgress(true);
            const result = await instance.post('/login', {
                username: username,
                password: password
            }, { withCredentials: true });
            const data = result.data;
            if (data.status === 'success') {
                const avatarLink = data.avatar;
                setAvatar(avatarLink);
                setShowCircularProgress(false);
                setShowLoginSuccess(true);
                setLoginUsername(username);
            }
        }
        catch (error) {
            if (error.message === 'Network Error') {
                setShowLoginError(true);
                setLoginErrorMessage('Backend is unreachable. Please contact the administrator.');
            }
            else if (/^timeout of [0-9]+ms exceeded$/.test(error.message)) {
                setShowLoginError(true);
                setLoginErrorMessage('Connection Timeout. Please contact the administrator.');
            }
            else if (error.response) {
                const data = error.response.data;
                if (data.status === 'failed') {
                    if (data.reason === 'InvalidUsernameOrPassword') {
                        setShowLoginError(true);
                        setLoginErrorMessage('Invalid username or password.');
                    }
                    else if (data.reason === 'DatabaseFailedError') {
                        setShowLoginError(true);
                        setLoginErrorMessage('Database error. Please contact the administrator.');
                    }
                    else if (data.reason === 'EmptyBodyError' || data.reason === 'TypeError') {
                        setShowLoginError(true);
                        setLoginErrorMessage('Invalid response.');
                    }
                }
                else {
                    setShowLoginError(true);
                    setLoginErrorMessage('Unknown error. Please contact the administrator.');
                }
            }
            else {
                setShowLoginError(true);
                setLoginErrorMessage('Unknown error. Please contact the administrator.');
            }
            setShowCircularProgress(false);
        }
    }

    return (
        redirectToMainPage
        ? <Redirect to='/home' />
        : <Container component='main' maxWidth='xs'>
            <CssBaseline />
            <div className={ classes.paper }>
                <Avatar className={ classes.avatar } variant='rounded'>
                    <LockIcon className={ classes.loginIcon } />
                </Avatar>
                <Typography component='h1' variant='h4' className={ classes.title }>
                    Login
                </Typography>
                <form className={ classes.form } noValidate>
                    <TextField
                        variant='outlined'
                        margin='normal'
                        id='username'
                        label='Username'
                        name='username'
                        autoComplete='username'
                        autoFocus
                        required
                        fullWidth
                        onChange={ (event) => setUsername(event.target.value) }
                    />
                    <TextField
                        variant='outlined'
                        margin='normal'
                        name='password'
                        label='Password'
                        type='password'
                        id='password'
                        autoComplete='current-password'
                        required
                        fullWidth
                        onChange={ (event) => setPassword(event.target.value) }
                    />
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        color='primary'
                        disabled={ !username || !password }
                        className={ classes.submit }
                        onClick={ loginAndRedirectToMainPage }
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link component={ RouterLink } to="/signup">
                                { "Don't have an account? Sign Up" }
                            </Link>
                        </Grid>
                    </Grid>
                </form>
                { showCircularProgress && <CircularProgress color='secondary' className={ classes.progress } /> }
                <Snackbar open={ showLoginSuccess } autoHideDuration={ 2000 } onClose={ handleCloseLoginSuccessMessage }>
                    <Alert severity='success'>
                        Login Success. Redirecting...
                    </Alert>
                </Snackbar>
                <Snackbar open={ showLoginError } autoHideDuration={ 6000 } onClose={ handleCloseErrorMessage }>
                    <Alert onClose={ handleCloseErrorMessage } severity='error'>
                    {
                        loginErrorMessage
                    }
                    </Alert>
                </Snackbar>
            </div>
        </Container>
    );
}

export default LoginPage;
