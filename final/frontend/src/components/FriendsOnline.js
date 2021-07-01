import React from 'react';
//import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CommentIcon from '@material-ui/icons/Comment';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
//import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
//import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import RefreshIcon from '@material-ui/icons/Refresh';

import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    list: {
        minWidth: 300,
        maxHeight: 250,
        minHeight: 250,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    listinfo: {
        minWidth: 300,
        maxHeight: 150,
        minHeight: 150,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    title: {
        flexGrow: 1,
        height: 40,
    },
    box: {
        maxHeight: 500,
        minHeight: 500,
    },
    button: {
        marginBottom: 7,
        marginLeft: theme.spacing(15),
        
    },
}));

function  FriendsOnline({instance, username, myfriends, setmyfriends}) {
    const classes = useStyles();
    const [info, setinfo] = useState([]);

    const getfriendsonline = async () => {
        const data = await instance.post('/friends/get', { user: username }, { withCredentials: true });
        setmyfriends(data.data.body);
    }

    const friendinfo = async (friend) => {
        const friendinfo = await instance.post('/friends/info', { user: username, friend: friend }, { withCredentials: true });
        console.log(friendinfo.data.body)
        setinfo(friendinfo.data.body);
    }
/*
            <ListItem key="gender" >
            <ListItemText
                id="genderid"
                primary={"Gender : "+info.gender} 
            />
            </ListItem>
            <ListItem key="birthday" >
            <ListItemText
                id="birthdayid"
                primary={"Birthday : "+info.birthday} 
            />
            </ListItem>
*/
    const getinfo = () => {
        return(
            <>
            </>
        )
    }

    return (
    <>
        <Box boxShadow={1} className={classes.box}>
            <AppBar position="static" style={{ background: '#DD66EE', maxHeight: 50 }}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Friends Online
                    </Typography>
                    <IconButton
                        className={ classes.button }
                        size='small'
                        onClick={() => getfriendsonline()}
                    >
                        <RefreshIcon style={{color: 'white'}}/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <List className={ classes.list }>
            { myfriends !== null && myfriends.length !== 0 && (myfriends.findIndex((f)=>{
                    return f[1] === true;
                }) !== -1 ) ? 
                myfriends.filter((f) => {
                    return f[1] === true;
                }).map((value) => {
                const labelId = `list-label-${value[0]}`;
                return (
                    <ListItem key={value[0]} button onClick={() => friendinfo} >
                        <ListItemText id={labelId} primary={value[0]} />
                        <ListItemSecondaryAction>
                        <IconButton 
                            edge="end" 
                            aria-label="comments"
                            onClick={() => friendinfo(value[0])}
                        >
                            <CommentIcon style={{color: '#993399'}}/>
                        </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            }) : <ListItem key="empty" >
                    <ListItemText id="empty" primary="No friends online ..." />
                </ListItem>
            }
            </List>
            { info.length !== 0 ? (
                <>
                <AppBar position="static" style={{ background: '#EEAA33', maxHeight: 50 }}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            Info
                        </Typography>
                        <Button
                            className={ classes.button }
                            variant='contained'
                            color='secondary'
                            size='small'
                            onClick={() => setinfo([])}
                        >
                            Close
                        </Button>
                    </Toolbar>
                </AppBar>
                <List className={ classes.listinfo }>
                    <ListItem key="name" >
                        <ListItemText
                            id="nameid"
                            primary={"Name : " + info.name} 
                        />
                    </ListItem>
                    <ListItem key="status" >
                    <ListItemText
                        id="statusid"
                        primary={"Status : "+info.status} 
                    />
                    </ListItem> 
                    <ListItem key="Currentroom" >
                    <ListItemText
                        id="Currentroomid"
                        primary={"Current room : " + info.room} 
                    />
                    </ListItem>
                    <ListItem key="gender" >
                    <ListItemText
                        id="genderid"
                        primary={"Gender : " + info.gender} 
                    />
                    </ListItem>
                    <ListItem key="birthday" >
                    <ListItemText
                        id="birthdayid"
                        primary={"Birthday : "+info.birthday} 
                    />
                    </ListItem>
                    <ListItem key="company" >
                    <ListItemText
                        id="companyid"
                        primary={"Company : "+info.company} 
                    />
                    </ListItem>
                    <ListItem key="email" >
                    <ListItemText
                        id="emailid"
                        primary={"Email : "+info.email} 
                    />
                    </ListItem> 
                </List>
                </>
                ) : (<></>)
            }
        </Box>
    </>
    );
}


export default FriendsOnline;
