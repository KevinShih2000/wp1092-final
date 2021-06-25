import { Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import SendIcon from '@material-ui/icons/Send';

import { deepOrange } from '@material-ui/core/colors';

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

function TextInput() {
    const classes = useStylesTextInput();
    return (
        <>
            <form className={ classes.container } noValidate autoComplete='off'>
            <TextField
                id='standard-text'
                label='Aa'
                className={ classes.text }
            />
            <IconButton color='primary'>
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
            padding: 0,
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
        }
    })
);

function Message({ message, timestamp, image, username, direction }) {
    const classes = useStyleMessage();

    if (direction === 'left') {
        return (
            <>
                <div className={ classes.messageRowLeft }>
                    <Avatar
                        alt={ username }
                        className={ classes.avatar }
                        src={ image }
                    ></Avatar>
                    <div>
                        <div className={ classes.displayName }>{ username }</div>
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

function MessageRight(props) {
    const classes = useStyleMessage();
    const message = props.message ? props.message : 'no message';
    const timestamp = props.timestamp ? props.timestamp : '';
};

const useStylesChatRoom = makeStyles((theme) =>
    createStyles({
        paper: {
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
            width: '75%',
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
        }
    })
);

function ChatRoom() {
    const classes = useStylesChatRoom();
    return (
        <div className={ classes.container }>
            <Paper className={ classes.paper }>
                <Paper className={ classes.messagesBody }>
                    <Message
                        message='空露露'
                        timestamp={ new Date().toLocaleString() }
                        image='https://static.wikia.nocookie.net/virtualyoutuber/images/d/dd/Suzuhara_Lulu_Portrait.png'
                        username='鈴原るる'
                        direction='left'
                    />
                    <Message
                        message='他一定是喜歡我啦'
                        timestamp={ new Date().toLocaleString() }
                        image='https://static.wikia.nocookie.net/virtualyoutuber/images/2/29/Ange_Katrina_Portrait.png'
                        username='アンジュ・カトリーナ'
                        direction='left'
                    />
                    <Message
                        message='AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                        timestamp={ new Date().toLocaleString() }
                        image='https://img.moegirl.org.cn/common/d/da/Motoaki_Tanigo.jpg'
                        username='yagoo'
                        direction='right'
                    />
                </Paper>
                <TextInput />
            </Paper>
        </div>
    );
}

export default ChatRoom;
