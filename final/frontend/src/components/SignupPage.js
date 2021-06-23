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
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import LockIcon from '@material-ui/icons/Lock';

import MuiAlert from '@material-ui/lab/Alert';

import { Redirect } from "react-router-dom";
import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    signupAvatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.dark,
        height: '5em',
        width: '5em'
    },
    signupIcon: {
        fontSize: '3em'
    },
    title: {
        marginTop: theme.spacing(1)
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function SignupPage() {
    const classes = useStyles();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRetype, setPasswordRetype] = useState('');

    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [duplicateUserError, setDuplicateUserError] = useState(false);
    const [showCircularProgress, setShowCircularProgress] = useState(false);
    const [showSignupSuccess, setShowSignupSuccess] = useState(false);
    const [showSignupError, setShowSignupError] = useState(false);
    const [redirectToLoginPage, setRedirectToLoginPage] = useState(false);

    const [signupErrorMessage, setSignupErrorMessage] = useState('');

    async function checkDuplicateUsername(event) {
        if (!username) {
            return;
        }
        try {
            const result = await instance.post('/checkname', {
                username: username
            });
            const data = result.data;
            if (data.status === 'success') {
                setDuplicateUserError(false);
            }
        }
        catch (error) {
            if (error.response) {
                const data = error.response.data;
                if (data.status === 'failed') {
                    if (data.reason === 'DuplicateUserError') {
                        setDuplicateUserError(true);
                    }
                }
            }
        }
    }

    function checkPasswordMissmatch(event) {
        if (password && passwordRetype && password !== passwordRetype) {
            setPasswordMismatch(true);
            return;
        }
        setPasswordMismatch(false);
    }

    async function checkAndSubmitSigninData(event) {
        event.preventDefault();

        try {
            setShowCircularProgress(true);
            const result = await instance.post('/signup', {
                username: username,
                password: password
            });
            const data = result.data;
            if (data.status === 'success') {
                setShowCircularProgress(false);
                setShowSignupSuccess(true);
            }
        }
        catch (error) {
            if (error.message === 'Network Error') {
                setShowSignupError(true);
                setSignupErrorMessage('Backend is unreachable. Please contact the administrator.');
            }
            else if (/^timeout of [0-9]+ms exceeded$/.test(error.message)) {
                setShowSignupError(true);
                setSignupErrorMessage('Connection Timeout. Please contact the administrator.');
            }
            else if (error.response) {
                const data = error.response.data;
                if (data.status === 'failed') {
                    if (data.reason === 'DuplicateUserError') {
                        setShowSignupError(true);
                        setSignupErrorMessage('Duplicate user found.');
                    }
                    else if (data.reason === 'DatabaseFailedError') {
                        setShowSignupError(true);
                        setSignupErrorMessage('Database error. Please contact the administrator.');
                    }
                    else if (data.reason === 'EmptyBodyError' || data.reason === 'TypeError') {
                        setShowSignupError(true);
                        setSignupErrorMessage('Invalid response.');
                    }
                }
                else {
                    setShowSignupError(true);
                    setSignupErrorMessage('Unknown error. Please contact the administrator.');
                }
            }
            else {
                setShowSignupError(true);
                setSignupErrorMessage('Unknown error. Please contact the administrator.');
            }
            setShowCircularProgress(false);
        }
    }

    function handleCloseSignupSuccessMessage() {
        setRedirectToLoginPage(true);
    }

    function handleCloseErrorMessage() {
        setShowSignupError(false);
        setSignupErrorMessage('');
    }

    return (
        redirectToLoginPage
        ? <Redirect to='/login' />
        : <Container component='main' maxWidth='xs'>
            <CssBaseline />
            <div className={ classes.container }>
                <Avatar className={ classes.signupAvatar } variant='rounded'>
                    <LockIcon className={ classes.signupIcon } />
                </Avatar>
                <Typography component='h1' variant='h4' className={ classes.title }>
                    Sign Up
                </Typography>
                <form className={ classes.form } noValidate>
                    <TextField
                        variant='outlined'
                        margin='normal'
                        id='username'
                        label='Username'
                        name='username'
                        error={ duplicateUserError }
                        helperText={ duplicateUserError && 'Duplicate username' }
                        autoFocus
                        required
                        fullWidth
                        onChange={ (event) => setUsername(event.target.value) }
                        onBlur={ checkDuplicateUsername }
                    />
                    <TextField
                        variant='outlined'
                        margin='normal'
                        name='password'
                        label='Password'
                        type='password'
                        id='password'
                        error={ passwordMismatch }
                        required
                        fullWidth
                        onChange={ (event) => setPassword(event.target.value) }
                        onBlur={ checkPasswordMissmatch }
                    />
                    <TextField
                        variant='outlined'
                        margin='normal'
                        name='passwordRetype'
                        label='Retype your password'
                        type='password'
                        id='passwordRetype'
                        error={ passwordMismatch }
                        helperText={ passwordMismatch && 'Password missmatch' }
                        required
                        fullWidth
                        onChange={ (event) => setPasswordRetype(event.target.value) }
                        onBlur={ checkPasswordMissmatch }
                    />
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        color='primary'
                        className={ classes.submit }
                        onClick={ checkAndSubmitSigninData }
                        disabled={ !username || !password || !passwordRetype ||
                            password !== passwordRetype || duplicateUserError || passwordMismatch }
                    >
                        Sign Up
                    </Button>
                </form>
                { showCircularProgress && <CircularProgress color='secondary' /> }
                <Snackbar open={ showSignupSuccess } autoHideDuration={ 2000 } onClose={ handleCloseSignupSuccessMessage }>
                    <Alert severity='success'>
                        Sign up Success. Redirecting...
                    </Alert>
                </Snackbar>
                <Snackbar open={ showSignupError } autoHideDuration={ 6000 } onClose={ handleCloseSignupSuccessMessage }>
                    <Alert onClose={ handleCloseErrorMessage } severity='error'>
                    {
                        signupErrorMessage
                    }
                    </Alert>
                </Snackbar>
            </div>
        </Container>
    );
}

export default SignupPage;
