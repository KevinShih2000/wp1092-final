import React from 'react';
import PropTypes from 'prop-types';
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

import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles1 = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5),
        background: 'white',
    },
}));

const friends = [
    'Cupcake',
    'Donut',
    'Eclair',
    'Frozen yoghurt',
    'Gingerbread',
    'Honeycomb',
    'Ice cream sandwich',
    'Jelly Bean',
    'KitKat',
    'Marshmallow',
    'Macaron',
    'Pudding',
    'Cheesecake',
    'Brownie'
].sort();

const useStyles = makeStyles((theme) => ({
    list: {
        minWidth: 300,
        maxHeight: 270,
        minHeight: 270,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    listinfo: {
        minWidth: 300,
        maxHeight: 160,
        minHeight: 160,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    title: {
        flexGrow: 1,
    },
    box: {
        maxHeight: 545,
        minHeight: 545,
    },
    button: {
        marginBottom: 7,
        marginLeft: theme.spacing(35),
    }
}));

function Friends({instance, username, myfriends, setmyfriends}) {
    const classes = useStyles();
    const [info, setinfo] = useState([]);

    const handleclick = async (friend) => {
        const newfriends = await instance.post('/friends/unfollow', { user: username, friend: friend }, { withCredentials: true });
        setmyfriends(newfriends.data.body);
    }

    const friendinfo = async (friend) => {
        const friendinfo = await instance.post('/friends/info', { user: username, friend: friend }, { withCredentials: true });
        console.log(friendinfo.data.body)
        setinfo(friendinfo.data.body);
    }

    return (
    <>
        <Box boxShadow={1} className={classes.box}>
            <AppBar position="static" style={{ background: '#DD66EE'}}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Friends
                    </Typography>
                </Toolbar>
            </AppBar>
            <List className={ classes.list }>
            { (myfriends !== null && myfriends.length) !== 0 ?
            myfriends.map((value) => {
                const labelId = `list-label-${value[0]}`;
                return (
                    <ListItem key={value[0]} role={undefined} button >
                        <ListItemText id={labelId} primary={value[0]} />
                        <ListItemSecondaryAction>
                        <Button
                            variant='outlined'
                            color='secondary'
                            size='small'
                            onClick={() => handleclick(value[0])}
                        >
                            unfollow
                        </Button>
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
            }) : (<ListItem key="empty" >
                    <ListItemText id="empty" primary="No friends" />
                </ListItem>
            )}
            </List>
            { info.length !== 0 ? (
                <>
                <AppBar position="static" style={{ background: '#EEAA55', maxHeight: 50 }}>
                    <Toolbar>
                        <Typography variant="h6" >
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


export default Friends;
