import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AddBoxIcon from '@material-ui/icons/AddBox';

import { Link as RouterLink } from 'react-router-dom';

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
    appBarSpacer: theme.mixins.toolbar,
    content: {
        width: '100vw',
        overflow: 'auto'
    },
    main: {
        minHeight: '100vh',
    },
    mainTitle: {
        color: '#1976d2',
        marginBottom: theme.spacing(3),
    },
    subTitle: {
        color: '#1976d2',
        marginBottom: theme.spacing(3),
    }
}));

function LandingPage(props) {
    const classes = useStyles();

    return (
        <Container className={classes.root}>
            <CssBaseline />
            <AppBar position="absolute" className={ classes.appBar }>
                <Toolbar className={ classes.toolbar }>
                    <Typography component="h1" variant="h6" noWrap className={ classes.title }>
                        Dashboard
                    </Typography>
                        <Link component={ RouterLink } to="/signup">
                            <Button
                                variant="outlined"
                                startIcon={ <AddBoxIcon /> }
                                className={ classes.menuButton }
                            >
                                    Sign Up
                            </Button>
                        </Link>
                        <Link component={ RouterLink } to="/login">
                            <Button
                                variant="outlined"
                                startIcon={ <AccountBoxIcon /> }
                                className={ classes.menuButton }
                            >
                                    Login
                            </Button>
                        </Link>
                </Toolbar>
            </AppBar>
            <main className={ classes.content }>
                <div className={ classes.appBarSpacer } />
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    className={ classes.main }
                >
                    <Grid item xs={12}>
                        <Typography variant="h3" className={ classes.mainTitle }>
                            [109-2] Web Programming Final
                        </Typography>
                        <Typography variant="h4" className={ classes.subTitle }>
                            Chat Chat Chat
                        </Typography>
                    </Grid>
                </Grid>
            </main>
        </Container>
    );
}

export default LandingPage;
