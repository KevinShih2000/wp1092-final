import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import AddBoxIcon from '@material-ui/icons/AddBox';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(8),
        }
    },
    text: {
        color: '#1976d2',
    },
    button: {
        margin: theme.spacing(2),
        backgroundColor: '#1976d2',
    },
    mainTitle: {
        color: '#1976d2',
    },
}));

function CreateJoinRoom({ setCurrentRoom, setMyRooms }) {
    const classes = useStyles();

    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomPassword, setRoomPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const [duplicateRoomError, setDuplicateRoomError] = useState(false);
    const [invalidRoomError, setInvalidRoomError] = useState(false);
    const [incorrectRoomPasswordError, setIncorrectRoomPasswordError] = useState(false);

    const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
    const [showJoinRoomDialog, setShowJoinRoomDialog] = useState(false);

    const [joinRoomPasswordRequired, setJoinRoomPasswordRequired] = useState(false);

    function closeCreateRoomDialog() {
        setRoomName('');
        setRoomPassword('');
        setShowCreateRoomDialog(false);
    }

    async function handleCreateRoom() {
        try {
            const result = await instance.post('/createRoom', { roomName: roomName, roomPassword: roomPassword }, { withCredentials: true });
            const data = result.data;
            if (data.status === 'success') {
                setRoomId(data.roomId);
                setCurrentRoom({ roomName, roomId })
                setShowCreateRoomDialog(false);
                setRoomName('');
                setRoomPassword('');
                setMyRooms(null);
            }
        }
        catch (error) {
            if (error.response) {
                const data = error.response.data;
                if (data.status === 'failed') {
                    if (data.reason === 'DuplicateRoomName') {
                        setDuplicateRoomError(true);
                    }
                    else {
                        setShowCreateRoomDialog(false);
                    }
                }
                else {
                    setShowCreateRoomDialog(false);
                }
            }
            else {
                setShowCreateRoomDialog(false);
            }
        }
    }

    function closeJoinRoomDialog() {
        setRoomName('');
        setRoomPassword('');
        setShowJoinRoomDialog(false);
        setJoinRoomPasswordRequired(false);
    }

    function backToJoinRoom() {
        setJoinRoomPasswordRequired(false);
    }

    async function handleJoinRoom() {
        const queryData = joinRoomPasswordRequired ? { roomName: roomName, roomPassword: roomPassword } : { roomName: roomName }
        try {
            const result = await instance.post('/joinRoom', queryData, { withCredentials: true });
            const data = result.data;
            if (data.status === 'success') {
                if (data.passwordRequired) {
                    setJoinRoomPasswordRequired(true);
                }
                else if (data.roomId) {
                    setRoomId(data.roomId);
                    setCurrentRoom({ roomName: roomName, roomId: data.roomId })
                    setMyRooms(null);
                }
                else {
                    setShowJoinRoomDialog(false);
                }
            }
            else {
                setShowJoinRoomDialog(false);
            }
        }
        catch (error) {
            if (error.response) {
                const data = error.response.data;
                if (data.status === 'failed') {
                    if (data.reason === 'RoomNameNotFound') {
                        setInvalidRoomError(true);
                    }
                    else if (data.reason === 'IncorrectRoomPassword') {
                        setIncorrectRoomPasswordError(true);
                    }
                    else {
                        setShowJoinRoomDialog(false);
                    }
                }
                else {
                    setShowJoinRoomDialog(false);
                }
            }
            else {
                setShowJoinRoomDialog(false);
            }
        }
    }

    return (
        roomId
        ? <Redirect to={ '/room?id=' + encodeURI(roomId) } />
        : <div className={ classes.root }>
            <Typography variant='h3' className={ classes.mainTitle }>
                Create a new room or join an existing room
            </Typography>
            <ButtonGroup color='primary' aria-label='outlined primary button group'>
                <Button
                    variant='contained'
                    color='primary'
                    size='large'
                    startIcon={ <AddBoxIcon /> }
                    onClick={ () => setShowCreateRoomDialog(true) }
                    className={ classes.button }
                >
                    Create a new room
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='large'
                    startIcon={ <MeetingRoomIcon /> }
                    onClick={ () => setShowJoinRoomDialog(true) }
                    className={ classes.button }
                    style={ { backgroundColor: '#ff7b25' } }
                >
                    Join an existing room
                </Button>
            </ButtonGroup>
            <Dialog
                open={ showCreateRoomDialog }
                onClose={ closeCreateRoomDialog }
                minwidth='lg'
                fullWidth
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>Create a new room</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter your room name. 
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        label='Room Name'
                        type='text'
                        fullWidth
                        onChange={ (event) => setRoomName(event.target.value) }
                        onFocus={ () => setDuplicateRoomError(false) }
                        error={ duplicateRoomError }
                        helperText={ duplicateRoomError && 'Duplicate room name' }
                    />
                    <TextField
                        margin='dense'
                        label='Room Password'
                        type={ showPassword ? 'text' : 'password' }
                        fullWidth
                        onChange={ (event) => setRoomPassword(event.target.value) }
                        error={ incorrectRoomPasswordError }
                        onFocus={ () => setIncorrectRoomPasswordError(false) }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                        aria-label='toggle password visibility'
                                        onClick={ () => setShowPassword(!showPassword) }
                                        onMouseDown={ () => setShowPassword(!showPassword) }
                                    >
                                        { showPassword ? <Visibility /> : <VisibilityOff /> }
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={ closeCreateRoomDialog }
                        color='secondary'
                        variant='contained'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={ handleCreateRoom }
                        color='primary'
                        variant='contained'
                        autoFocus
                        disabled={ !roomName || !roomPassword }
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={ showJoinRoomDialog }
                onClose={ closeJoinRoomDialog }
                minwidth='lg'
                fullWidth
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>
                {
                    !joinRoomPasswordRequired ? 'Join an existing room' : 'Password required'
                }
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    {
                        !joinRoomPasswordRequired ? 'Please enter your room name' : 'Please enter the room password'
                    }
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        label='Room Name'
                        type='text'
                        fullWidth
                        onChange={ (event) => setRoomName(event.target.value) }
                        onFocus={ () => setInvalidRoomError(false) }
                        error={ invalidRoomError }
                        helperText={ invalidRoomError && 'Room name does not exist' }
                        disabled={ joinRoomPasswordRequired }
                    />
                    {
                        joinRoomPasswordRequired &&
                        <TextField
                            margin='dense'
                            label='Room Password'
                            type={ showPassword ? 'text' : 'password' }
                            fullWidth
                            onChange={ (event) => setRoomPassword(event.target.value) }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            aria-label='toggle password visibility'
                                            onClick={ () => setShowPassword(!showPassword) }
                                            onMouseDown={ () => setShowPassword(!showPassword) }
                                        >
                                            { showPassword ? <Visibility /> : <VisibilityOff /> }
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={ joinRoomPasswordRequired ? backToJoinRoom : closeJoinRoomDialog }
                        color='secondary'
                        variant='contained'
                    >
                    {
                        joinRoomPasswordRequired ? 'Back' : 'Cancel'
                    }
                    </Button>
                    <Button
                        onClick={ handleJoinRoom }
                        color='primary'
                        variant='contained'
                        autoFocus
                        disabled={ !roomName || (joinRoomPasswordRequired && !roomPassword) }
                    >
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default CreateJoinRoom;
