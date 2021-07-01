import { useEffect, useState, useRef } from 'react';
import { Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';

import SendIcon from '@material-ui/icons/Send';

import MuiAlert from '@material-ui/lab/Alert';

import axios from 'axios';
import { io } from 'socket.io-client';
import { useSnackbar } from 'notistack';
import { Redirect } from 'react-router-dom';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function createData(name, avatar, message, timestamp) {
    return { name, avatar, message, timestamp};
}

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

const useStylesTextInput = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            margin: theme.spacing(2),
        },
        text: {
            width: '90%'
        },
    })
);

function TextInput({ roomName }) {
    const classes = useStylesTextInput();
    const [currMessage, setCurrMessage] = useState('');
    
    async function handleSendMessage() {
        const result = await instance.post('/send', { roomName: roomName, message: currMessage }, { withCredentials: true });
        setCurrMessage('');
    }

    return (
        <>
            <form className={ classes.container } noValidate autoComplete='off'>
            <TextField
                id='standard-text'
                label='Aa'
                className={ classes.text }
                value={currMessage}
                onChange={ (event) => setCurrMessage(event.target.value) }
            />
            <IconButton
                color='primary'
                onClick={ handleSendMessage }
            >
                <SendIcon />
            </IconButton>
            </form>
        </>
    )
}

const useStyleMessage = makeStyles((theme) =>
    createStyles({
        messageRowLeft: {
            display: 'flex',
            marginTop: theme.spacing(2)
        },
        messageRowRight: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        messageLeft: {
            marginLeft: '1.5em',
            marginBottom: '1em',
            padding: '1em',
            backgroundColor: '#d5f4e6',
            width: '20em',
            textAlign: 'left',
            border: '1px solid lightgrey',
            borderRadius: '10px',
        },
        messageRight: {
            marginRight: '1.5em',
            marginBottom: '1em',
            padding: '1em',
            backgroundColor: '#fefbd8',
            width: '20em',
            textAlign: 'left',
            border: '1px solid lightgrey',
            borderRadius: '10px',
        },
        messageContent: {
            margin: 0,
            overflowWrap: 'break-word'
        },
        messageTimestamp: {
            fontSize: '.85em',
            fontWeight: '200',
        },
        avatar: {
            backgroundColor: '#bdbdbd',
            width: '2em',
            height: '2em',
            left: '0.5em',
        },
        leftPadding: {
            left: '14em'
        },
        displayName: {
            marginLeft: '20px'
        },
    })
);

function Message({ message, timestamp, avatar, name, direction }) {
    const classes = useStyleMessage();
    if (direction === 'left') {
        return (
            <>
                <div className={ classes.messageRowLeft }>
                    <Avatar
                        alt={ name }
                        className={ classes.avatar }
                        src={ avatar }
                    ></Avatar>
                    <div>
                        <div className={ classes.displayName }>{ name }</div>
                        <div className={ classes.messageLeft }>
                            <div>
                                <p className={ classes.messageContent }>{ message }</p>
                            </div>
                            <div className={ classes.messageTimestamp }>{ timestamp }</div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    else {
        return (
            <>
                <div className={ classes.messageRowRight }>
                    <div className={ classes.leftPadding }>
                        <div className={ classes.messageRight }>
                            <p className={ classes.messageContent }>{ message }</p>
                            <div className={ classes.messageTimestamp }>{ timestamp }</div>
                        </div>
                    </div>
                </div>
             </>
        );
    }
};

const useStylesChatRoom = makeStyles((theme) =>
    createStyles({
        paper: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
            width: '75%',
            overflow: 'auto',
            maxHeight: '80vh'
        },
        container: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        messagesBody: {
            width: '100%',
            overflowY: 'scroll',
            height: '70vh',
            marginTop: theme.spacing(1)
        },
        button: {
            margin: theme.spacing(2)
        },
    })
);

function ChatRoom({ currentRoom, setCurrentRoom, username, setRedirectBackToHome, setMyRooms }) {
    const classes = useStylesChatRoom();
    const [messages, setMessages] = useState([]);
    const [currMessage, setCurrMessage] = useState('');
    const [newMessage, setNewMessage] = useState(null);
    const [showLeaveRoomDialog, setShowLeaveRoomDialog] = useState(false);
    const [showLeaveRoomError, setShowLeaveRoomError] = useState(false);
    const [leaveRoomErrorMessage, setLeaveRoomErrorMessage] = useState('');
    const [ws, setWs] = useState(null);

    const scrollRef = useRef(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    function handleCloseErrorMessage() {
        setShowLeaveRoomError(false);
        setLeaveRoomErrorMessage('');
    }

    async function handleLeaveRoom(leave) {
        if (leave) {
            try {
                const result = await instance.post('/leaveRoom', { roomName: currentRoom.roomName }, { withCredentials: true });
                const data = result.data;
                if (data.status === 'success') {
                    setCurrentRoom(null);
                    setRedirectBackToHome(true);
                    setMyRooms(null);
                }
            }
            catch (error) {
                if (error.message === 'Network Error') {
                    setShowLeaveRoomError(true);
                    setLeaveRoomErrorMessage('Backend is unreachable. Please contact the administrator.');
                }
                else if (/^timeout of [0-9]+ms exceeded$/.test(error.message)) {
                    setShowLeaveRoomError(true);
                    setLeaveRoomErrorMessage('Connection Timeout. Please contact the administrator.');
                }
                else {
                    setShowLeaveRoomError(true);
                    setLeaveRoomErrorMessage('Unknown error. Please contact the administrator.');
                }
            }
        }
        setShowLeaveRoomDialog(false);
    }

    function handleExitRoom() {
        setCurrentRoom(null);
        setRedirectBackToHome(true);
        setMyRooms(null);
    }

    useEffect(async () => {
        const result = await instance.post('/messages', { roomName: currentRoom.roomName }, { withCredentials: true });
        const data = result.data;
        if (data.status === 'success') {
            const messages = data.messages;
            setMessages(messages);
        }
    }, []);

    useEffect(() => {
        if (ws) {
            return;
        }
        const socket = io(process.env.REACT_APP_BACKEND_BASE_URL);
        socket.on('newMessage', (newMessage) => {
            setNewMessage(newMessage);
        });
        setWs(socket);
        return () => {
            if (ws) {
                ws.disconnect();
            }
        }
    }, [ws]);

    useEffect(() => {
        setMyRooms(null);
        if (newMessage && newMessage.roomName === currentRoom.roomName) {
            let origMessages = [...messages];
            origMessages.push({
                name: newMessage.name,
                message: newMessage.message,
                timestamp: newMessage.timestamp,
                avatar: newMessage.avatar
            });
            setMessages(origMessages);
            if (newMessage.name !== username) {
                enqueueSnackbar(`${newMessage.name}: ${newMessage.message}`, { variant: 'success' });
            }
        }
    }, [newMessage])

    useEffect(() => {
        if (scrollRef) {
            scrollRef.current.scrollIntoView({ behaviour: 'smooth' });
        }
    }, [messages]);

    return (
        <div className={ classes.container }>
            <Paper className={ classes.paper }>
                <Paper className={ classes.messagesBody }>
                {
                    messages.map(message => {
                        return (
                            <Message
                                key={ message.timestamp }
                                name={ message.name }
                                avatar={ message.avatar }
                                message={ message.message }
                                timestamp={ message.timestamp }
                                direction={ message.name === username ? 'right' : 'left' }
                            />
                        )
                    })
                }
                <div style={{ float:"left", clear: "both" }} ref={ scrollRef }>
                </div>
                </Paper>
                <TextInput roomName={ currentRoom === null ? '' : currentRoom.roomName } />
                <ButtonGroup>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={ handleExitRoom }
                        className={ classes.button }
                    >
                        Temporary Exit Room
                    </Button>
                    <Button
                        variant='contained'
                        color='secondary'
                        onClick={ () => setShowLeaveRoomDialog(true) }
                        className={ classes.button }
                    >
                        Permanently Leave Room
                    </Button>
                </ButtonGroup>
                <Dialog
                    open={ showLeaveRoomDialog }
                    onClose={ () => handleLeaveRoom(false) }
                    minWidth="xl"
                    fullWidth
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                >
                    <DialogTitle id='alert-dialog-title'>Leave Room</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Do you really want to leave the room?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={ () => handleLeaveRoom(false) } color='secondary' variant="contained">
                            Stay
                        </Button>
                        <Button onClick={ () => handleLeaveRoom(true) } color='primary' variant="contained" autoFocus>
                            Leave
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar open={ showLeaveRoomError } autoHideDuration={ 6000 } onClose={ handleCloseErrorMessage }>
                    <Alert onClose={ handleCloseErrorMessage } severity='error'>
                    {
                        leaveRoomErrorMessage
                    }
                    </Alert>
                </Snackbar>
            </Paper>
        </div>
    );
}

export default ChatRoom;
