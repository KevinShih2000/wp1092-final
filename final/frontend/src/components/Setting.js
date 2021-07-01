import React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        '& > *': {
            margin: theme.spacing(10),
        }
    },
    box1:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(2),
        }
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        '* > &': {
            margin: theme.spacing(10),
            width: '50ch',
        },
    },
    list: {
        minWidth: 300,
        maxHeight: 450,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
        top: '5em',
    },
    listItem: {
        color: 'rgba(0, 0, 0, 0.8)',
        '&:hover': {
            textDecoration: 'none',
        },
        width: '20em',
    },
    title: {
        flexGrow: 1,
        height: 40,
    },
    avatar: {
        backgroundColor: '#bdbdbd',
        width: '10em',
        height: '10em',
    },
    save: {
        width: '1em',
        left: '30em',
        bottom: '3em',
    },
    disable: {
        opacity: 0,
    }
    
}));

function UploadButton({ setAvatar }) {

    const [currFile, setCurrFile] = useState(null);
    const [showCircularProgress, setShowCircularProgress] = useState(false);

    async function uploadFile() {
        if (!currFile) {
            return;
        }
        setShowCircularProgress(true);
        const formData = new FormData();
        formData.append('image', currFile);
        const result = await instance.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        });
        const data = result.data;
        if (data.status === 'success') {
            setAvatar(data.avatar);
            setShowCircularProgress(false);
        }
    }

    return (
        <>
            {
                currFile === null ? '' : 'Currently chosen file: ' + currFile.name
            }
            <Button
                variant='contained'
                color='primary'
                component='label'
            >
                Select File
                <input
                    type='file'
                    hidden
                    onChange={ (event) => setCurrFile(event.target.files[0]) }
                />
            </Button>
            <Button
                variant='contained'
                component='label'
                onClick={ uploadFile }
            >
                Upload File
            </Button>
            {
                showCircularProgress && <CircularProgress color='primary' />
            }
        </>
    )
}
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Setting(props){
    const classes = useStyles();

    const username = props.username;
    const setUsername = props.setUsername;
    const [edit, setEdit] = useState(false);
    const [path, setPath] = useState("");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");

    const [newPassword ,setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const avatar = props.avatar;
    console.log(avatar);
    const setAvatar = props.setAvatar;

    async function getUserInfo() {
        setPath("account");
        try{
            const result = await instance.get('/getUserInfo', {
                params:{ name:username }
            }, { withCredentials: true });
            const data = result.data;
            // console.log(data)
            
            setGender(data.gender);
            setBirthday(data.birthday);
            setEmail(data.email);
            setCompany(data.company);
            

        }
        catch(error){
            setShowError(true);
            setErrorMessage('Data fetch failed. Please try again later.')
        }
    }

    async function handleAccountSave() {
        try{
            const result = await instance.post('/setting', {
                name: username,
                gender: gender,
                birthday: birthday,
                email: email,
                company: company
    
            }, { withCredentials: true });
            const data = result.data;
            // console.log(data.status)
            if (data.status === 'success'){
                setShowSuccess(true);
            }
        }
        catch(error){
            setShowError(true);
            if (error.message === 'Network Error') {
                setErrorMessage('Backend is unreachable. Please contact the administrator.');
            }
            else if (error.response){
                const data = error.response.data;
                if (data.status === 'failed'){
                    setErrorMessage('Invalid response.');
                }
                else{
                    setErrorMessage('Unknown error. Please contact the administrator.');
                }
            }
            else{
                setErrorMessage('Unknown error. Please contact the administrator.');
            }
        }

        setEdit(false);
    }

    async function handlePasswordSave() {

        if(!newPassword || !oldPassword){
            setShowError(true);
            setErrorMessage('Both new and old passwords are required.');
        }

        else if(newPassword === oldPassword){
            setShowError(true);
            setErrorMessage('New and old passwords should be different.');
        }

        else{
            try{
                const result = await instance.post('/changePassword', {
                    name: username,
                    oldPassword: oldPassword,
                    newPassword: newPassword,
        
                }, { withCredentials: true });
                const data = result.data;
                // console.log(data.status)
                if (data.status === 'success'){
                    setShowSuccess(true);
                }
            }
            catch(error){
                setShowError(true);
                if (error.message === 'Network Error') {
                    setErrorMessage('Backend is unreachable. Please contact the administrator.');
                }
                else if (error.response){
                    const data = error.response.data;
                    if (data.status === 'failed') {
                        if (data.reason === 'InvalidUsernameOrPassword') {
                            setErrorMessage('Incorrect password.');
                        }
                        else if (data.reason === 'DatabaseFailedError') {
                            setErrorMessage('Database error. Please contact the administrator.');
                        }
                        else{
                            setErrorMessage('Unknown error. Please contact the administrator.');
                        }
                    }
                    else{
                        setErrorMessage('Unknown error. Please contact the administrator.');
                    }
                }
                else{
                    setErrorMessage('Unknown error. Please contact the administrator.');
                }
            }
    
        }
        setNewPassword("");
        setOldPassword("");
        setEdit(false);
    }

    function handleCloseSuccessMessage(){
        setShowSuccess(false);
    }

    function handleCloseErrorMessage(){
        setShowError(false);
        setErrorMessage("");
    }

    return(
        
        <div className={ classes.root }>
            <Box className={ classes.box1 }>
                <Avatar alt="admid" className={ classes.avatar } src={ avatar }></Avatar>
                <UploadButton setAvatar={ setAvatar } />
                <List>
                    <Link className={ classes.listItem } component="button" variant="body2" onClick={ getUserInfo }>
                        <ListItem button>
                            <ListItemText primary='Account Setting' align="center"/>
                        </ListItem>
                    </Link>
                    <Link className={ classes.listItem } component="button" variant="body2" onClick={(e)=>setPath("password")}>
                        <ListItem button>
                            <ListItemText primary='Password Setting' align="center"/>
                        </ListItem>
                    </Link>
                </List>
                
            </Box>
            
            {path==="account" ?
            <Box boxShadow={1}>
            <AppBar position="static" style={{ background: '#DD66EE', maxHeight: 50 }}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Account Setting
                    </Typography>
                    {edit?
                        <Button variant="outlined" size="small" disabled > Edit </Button>
                        : <Button variant="outlined" size="small" onClick={ (e) => setEdit(true) }> Edit </Button>
                    }
                    
                </Toolbar>
                
            </AppBar>
            <form className={classes.form} autoComplete="off">
                <TextField label="User Name" value={ username } margin="normal" disabled/>
                <TextField label="Gender" select margin="normal" value={ gender } onChange={(e)=> setGender(e.target.value)} InputLabelProps={{ shrink: true, }} disabled={ edit?false:true }>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField label="Birthday" margin="normal" value={ birthday } onChange={(e)=> setBirthday(e.target.value)} InputLabelProps={{ shrink: true, }} disabled={ edit?false:true }/>
                <TextField label="Email" margin="normal" value={ email } onChange={(e)=> setEmail(e.target.value)} InputLabelProps={{ shrink: true, }} disabled={ edit?false:true }/>
                <TextField label="Company" margin="normal" value={ company } onChange={(e)=> setCompany(e.target.value)} InputLabelProps={{ shrink: true, }} disabled={ edit?false:true }/>
                
            </form>
            {edit?
                <Button className={ classes.save } variant="contained" onClick={ handleAccountSave }>Save</Button>
                :<Button className={ `${classes.save} + ${classes.disable}`} variant="contained" disabled>Save</Button>
            }
            
            </Box>: 
            path==="password" ?

            <Box boxShadow={1}>
            <AppBar position="static" style={{ background: '#DD66EE', maxHeight: 50 }}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Password Setting
                    </Typography>
                    
                </Toolbar>
                
            </AppBar>
            <form className={classes.form} autoComplete="off">
                <TextField label="New Password" margin="normal" type='password' value={ newPassword } onChange={(e)=>{ setNewPassword(e.target.value); setEdit(true); }}/>
                <TextField label="Old Password" margin="normal" type='password' value={ oldPassword } onChange={(e)=>{ setOldPassword(e.target.value); setEdit(true); }}/>
            </form>
            {edit?
                <Button className={ classes.save } variant="contained" onClick={ handlePasswordSave }>Change</Button>
                :<Button className={ `${classes.save} + ${classes.disable}`} variant="contained" disabled>Change</Button>
            }
            </Box>
            
            : <Box></Box>
            }

            <Snackbar open={ showSuccess } autoHideDuration={ 2000 } onClose={ handleCloseSuccessMessage }>
                <Alert severity='success'>
                    Saved.
                </Alert>
            </Snackbar>
            <Snackbar open={ showError } autoHideDuration={ 6000 } onClose={ handleCloseErrorMessage }>
                <Alert onClose={ handleCloseErrorMessage } severity='error'>
                {
                    errorMessage
                }
                </Alert>
            </Snackbar>
            
            
            
        </div>

        
    )
}
export default Setting;
