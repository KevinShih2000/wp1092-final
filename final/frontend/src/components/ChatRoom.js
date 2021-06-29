import { useEffect, useState, useRef } from 'react';
import { Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import SendIcon from '@material-ui/icons/Send';

import axios from 'axios';
import { io } from 'socket.io-client';
import { useSnackbar } from 'notistack';
import { Redirect } from 'react-router-dom';

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
    }

    return (
        <>
            <form className={ classes.container } noValidate autoComplete='off'>
            <TextField
                id='standard-text'
                label='Aa'
                className={ classes.text }
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
        },
        leaveButton: {
            marginBottom: theme.spacing(2)
        },
    })
);

function ChatRoom({ currentRoom, setCurrentRoom, username, setRedirectBackToHome }) {
    const classes = useStylesChatRoom();
    const [messages, setMessages] = useState([]);
    const [currMessage, setCurrMessage] = useState('');
    const [newMessage, setNewMessage] = useState(null);
    const [ws, setWs] = useState(null);
    const scrollRef = useRef(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    function handleLeaveRoom() {
        setCurrentRoom(null);
        setRedirectBackToHome(true);
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
        if (newMessage) {
            let origMessages = [...messages];
            origMessages.push(newMessage);
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
                <Button
                    variant='contained'
                    color='secondary'
                    onClick={ handleLeaveRoom }
                    className={ classes.leaveButton }
                >
                    Leave Room
                </Button>
            </Paper>
        </div>
    );
}

export default ChatRoom;
