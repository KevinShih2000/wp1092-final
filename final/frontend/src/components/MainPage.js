import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Backdrop from '@material-ui/core/Backdrop';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import CssBaseline from '@material-ui/core/CssBaseline';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AddBoxIcon from '@material-ui/icons/AddBox';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BarChartIcon from '@material-ui/icons/BarChart';
import ChatIcon from '@material-ui/icons/Chat';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HomeIcon from '@material-ui/icons/Home';
import LayersIcon from '@material-ui/icons/Layers';
import MenuIcon from '@material-ui/icons/Menu';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import NotificationsIcon from '@material-ui/icons/Notifications';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';

import { Link as RouterLink, Redirect, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios';

import Lobby from './Lobby';
import Users from './Users';
import Friends from './Friends'
import FriendsOnline from './FriendsOnline'
import ChatRoom from './ChatRoom';
import CreateJoinRoom from './CreateJoinRoom';
import Setting from './Setting';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24,
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        width: 'calc(100% - 240px)',
        left: '240px',
        backgroundColor: theme.palette.primary.dark
    },
    menuButton: {
        marginRight: 24,
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        backgroundColor: 'white',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: '#7aa7c7',
            color: '#efefef',
        }
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        color: '#efefef',
        flexGrow: 1,
    },
    username: {
        marginRight: theme.spacing(2)
    },
    drawerPaper: {
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: '240px',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: 'white'
    },
    container: {
        position: 'absolute',
        left: '240px',
        right: 0,
        width: 'calc(100% - 240px)',
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    listItem: {
        color: 'rgba(0, 0, 0, 0.8)',
        '&:hover': {
            textDecoration: 'none',
        }
    },
    paper: {
        padding: theme.spacing(2),
        height: '80vh',
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    linkText: {
        color: '#efefef'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1
    },
    paperButton: {
        marginRight: 24,
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        backgroundColor: 'white',
        borderRadius: '8px',
    },
}));

function LogoutDialog({ open, handleLogout }) {
    return (
        <Dialog
            open={ open }
            onClose={ () => handleLogout(false) }
            minWidth="xl"
            fullWidth
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle id='alert-dialog-title'>Logout</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Do you really want to logout?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={ () => handleLogout(false) } color='secondary' variant="contained">
                    Stay
                </Button>
                <Button onClick={ () => handleLogout(true) } color='primary' variant="contained" autoFocus>
                    Logout
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function RedirectToHome({ setRedirectBackToHome }) {
    setRedirectBackToHome(false);
    return <Redirect to='/home' />;
}

function MainPage(props) {
    const classes = useStyles();

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showCircularProgress, setShowCircularProgress] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [redirectBackToHome, setRedirectBackToHome] = useState(false);
    const [myfriends, setmyfriends] = useState(null);
    const [myRooms, setMyRooms] = useState(null);

    const setIsLoggedIn = props.setIsLoggedIn;
    const username = props.username;
    const setUsername = props.setUsername;
    const avatar = props.avatar;
    const setAvatar = props.setAvatar;

    const loc = useLocation();

    useEffect(() => {
        console.log(myRooms);
        if(myfriends === null){
            getfriends();
            changestatus();
        }
        if(myRooms === null){
            getRooms();
        }
    }, [myfriends, myRooms])

    async function getfriends() {
        const friendsdata = await instance.post('/friends/get', { user: username }, { withCredentials: true });
        // console.log(friendsdata)
        setmyfriends(friendsdata.data.body);
    }

    async function changestatus() {
        await instance.post('/online', { user: username }, { withCredentials: true });
    }

    async function getRooms(){
        const result = await instance.get('/rooms/get', { 
            params:{ user: username }
        }, { withCredentials: true });
        const data = result.data;
        setMyRooms(data);
    }

    async function handleLogout(logout) {
        setShowLogoutDialog(false);
        if (logout) {
            setShowCircularProgress(true);
            const result = await instance.post('/logout', {user: username}, { withCredentials: true });
            const data = result.data;
            setShowCircularProgress(false);
            if (data.status === 'success') {
                setIsLoggedIn(false);
            }
        }
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position='absolute' className={ classes.appBar }>
                <Toolbar className={ classes.toolbar }>
                    <Typography component='h1' variant='h6' noWrap className={ classes.title }>
                        Dashboard
                    </Typography>
                    <Typography component='h1' variant='h6' className={ classes.username }>
                        Hi, { username }!
                    </Typography>
                    <Button
                        variant='outlined'
                        startIcon={ <ExitToAppIcon /> }
                        className={ classes.menuButton }
                        onClick={ () => setShowLogoutDialog(true) }
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant='permanent'
                classes={{
                    paper: classes.drawerPaper
                }}
            >
                <List>
                    <Link component={ RouterLink } to='/home' className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary='Home' />
                        </ListItem>
                    </Link>
                    {
                        currentRoom === null && <Link component={ RouterLink } to='/chat' className={ classes.listItem }>
                            <ListItem button>
                                <ListItemIcon>
                                    <ChatIcon />
                                </ListItemIcon>
                                <ListItemText primary='Chat' />
                            </ListItem>
                        </Link>
                    }
                    {
                        currentRoom !== null && <Link component={ RouterLink } to={ '/room?id=' + encodeURI(currentRoom.roomId) } className={ classes.listItem }>
                            <ListItem button>
                                <ListItemIcon>
                                    <MeetingRoomIcon />
                                </ListItemIcon>
                                <ListItemText primary='Chat Room' />
                            </ListItem>
                        </Link>
                    }
                    <Link component={ RouterLink } to='/friends' className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary='Friends' />
                        </ListItem>
                    </Link>
                    <Link component={ RouterLink } to='/setting' className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary='Setting' />
                        </ListItem>
                    </Link>
                </List>
            </Drawer>
            <main className={ classes.content }>
                <div className={ classes.appBarSpacer } />
                {
                    loc.pathname === '/chat'
                    ?  <Container className={ classes.container }>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <CreateJoinRoom setCurrentRoom={ setCurrentRoom } setRedirectBackToHome={ setRedirectBackToHome } setMyRooms={ setMyRooms }/>
                            </Grid>
                        </Grid>
                    </Container>

                    : loc.pathname === '/room'
                    ? <Container className={ classes.container }>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                            {
                                redirectBackToHome && <RedirectToHome setRedirectBackToHome={ setRedirectBackToHome } />
                            }
                            {
                                currentRoom && username &&
                                <ChatRoom
                                    username={ username }
                                    currentRoom={ currentRoom }
                                    setCurrentRoom={ setCurrentRoom }
                                    setRedirectBackToHome={ setRedirectBackToHome }
                                    setMyRooms={ setMyRooms }
                                />
                            }
                            </Grid>
                        </Grid>
                    </Container>

                    : loc.pathname === '/friends'
                    ? <Container className={ classes.container }>
                        <Grid container spacing={3}>
                            <Grid item xs={7}>
                                <Users 
                                    instance={instance}
                                    username={username}
                                    myfriends={myfriends}
                                    setmyfriends={setmyfriends}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <Friends 
                                    instance={instance}
                                    username={username}
                                    myfriends={myfriends}
                                    setmyfriends={setmyfriends}
                                />
                            </Grid>
                        </Grid>
                    </Container>

                    : loc.pathname === '/setting'
                    ? <Container className={ classes.container }>
                        <Grid container spacing={3}>
                            <Grid item xs={7}>
                                <Setting username={ username } setUsername={ setUsername } avatar={ avatar } setAvatar={ setAvatar } />
                            </Grid>
                        </Grid>
                    </Container>

                    : <Container className={ classes.container }>
                        <Grid container spacing={3}>
                            <Grid item xs={8}>
                                <Lobby currentRoom={ currentRoom } setCurrentRoom={ setCurrentRoom } myRooms={ myRooms } />
                            </Grid>
                            <Grid item xs={4}>
                                <FriendsOnline
                                    instance={instance}
                                    username={username}
                                    myfriends={myfriends}
                                    setmyfriends={setmyfriends}
                                />
                            </Grid>
                        </Grid>
                    </Container>
                }
            </main>
            <Backdrop className={ classes.backdrop } open={ showCircularProgress }>
                <CircularProgress color='primary' className={ classes.progress } />
            </Backdrop>
            <LogoutDialog open={ showLogoutDialog } handleLogout={ handleLogout } />
        </div>
    );
}

export default MainPage;
