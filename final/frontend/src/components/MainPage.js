import { useState } from 'react';
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
import HomeIcon from '@material-ui/icons/Home';
import LayersIcon from '@material-ui/icons/Layers';
import MenuIcon from '@material-ui/icons/Menu';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import NotificationsIcon from '@material-ui/icons/Notifications';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';

import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios';

import Lobby from './Lobby';
import Users from './Users';

const drawerWidth = '16vw';
const remainWidth = '84vw';

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
        width: remainWidth,
        left: drawerWidth,
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
        width: drawerWidth,
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
    },
    container: {
        position: 'absolute',
        left: drawerWidth,
        right: 0,
        width: remainWidth,
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
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
    },
    linkText: {
        color: '#efefef'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1
    },
}));

function LogoutDialog({ open, handleLogout }) {
    return (
        <Dialog
            open={ open }
            onClose={ () => handleLogout(false) }
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Do you really want to logout?</DialogTitle>
            <DialogActions>
                <Button onClick={ () => handleLogout(false) } color="primary">
                    Stay
                </Button>
                <Button onClick={ () => handleLogout(true) } color="primary" autoFocus>
                    Logout
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function MainPage(props) {
    const classes = useStyles();

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showCircularProgress, setShowCircularProgress] = useState(false);

    const setIsLoggedIn = props.setIsLoggedIn;
    const username = props.username;
    const setUsername = props.setUsername;

    async function handleLogout(logout) {
        setShowLogoutDialog(false);
        if (logout) {
            setShowCircularProgress(true);
            const result = await instance.post('/logout', null, { withCredentials: true });
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
            <AppBar position="absolute" className={ classes.appBar }>
                <Toolbar className={ classes.toolbar }>
                    <Typography component="h1" variant="h6" noWrap className={ classes.title }>
                        Dashboard
                    </Typography>
                    <Typography component="h1" variant="h6" className={ classes.username }>
                        Hi, { username }!
                    </Typography>
                    <Link component={ RouterLink } to="/logout">
                        <Button
                            variant="outlined"
                            startIcon={ <AddBoxIcon /> }
                            className={ classes.menuButton }
                            onClick={ () => setShowLogoutDialog(true) }
                        >
                                Logout
                        </Button>
                    </Link>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper
                }}
            >
                <List>
                    <Link component={ RouterLink } to="/home" className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
                    </Link>
                    <Link component={ RouterLink } to="/chat" className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <ChatIcon />
                            </ListItemIcon>
                            <ListItemText primary="Chat" />
                        </ListItem>
                    </Link>
                    <Link component={ RouterLink } to="/meeting" className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <MeetingRoomIcon />
                            </ListItemIcon>
                            <ListItemText primary="Meeting" />
                        </ListItem>
                    </Link>
                    <Link component={ RouterLink } to="/friends" className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Friends" />
                        </ListItem>
                    </Link>
                    <Link component={ RouterLink } to="/setting" className={ classes.listItem }>
                        <ListItem button>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Setting" />
                        </ListItem>
                    </Link>
                </List>
            </Drawer>
            <main className={ classes.content }>
                <div className={ classes.appBarSpacer } />
                <Container className={ classes.container }>
                    <Grid container spacing={3}>
                        <Grid item xs={8}>
                            <Paper className={ classes.paper }>
                                <Lobby />
                            </Paper>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={ classes.paper }>
                                <Users />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </main>
            <Backdrop className={ classes.backdrop } open={ showCircularProgress }>
                <CircularProgress color='primary' className={ classes.progress } />
            </Backdrop>
            <LogoutDialog open={ showLogoutDialog } handleLogout={ handleLogout } />
        </div>
    );
}

export default MainPage;

/*
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={fixedHeightPaper}>
                                <Chart />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4} lg={3}>
                            <Paper className={fixedHeightPaper}>
                                <Deposits />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Orders />
                            </Paper>
                        </Grid>
                    <Box pt={4}>
                        <Copyright />
                    </Box>
import Chart from './Chart';
import Deposits from './Deposits';
import Orders from './Orders';

*/
