import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CommentIcon from '@material-ui/icons/Comment';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
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

const useStyles2 = makeStyles((theme) => ({
    list: {
        minWidth: 300,
        maxHeight: 450,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    title: {
        flexGrow: 1,
        height: 40,
    },
}));

function Users() {
    const classes = useStyles2();
    return (
    <>
        <Box boxShadow={1}>
            <AppBar position="static" style={{ background: '#DD66EE', maxHeight: 50 }}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Friends Online
                    </Typography>
                </Toolbar>
            </AppBar>
            <List className={ classes.list }>
            {friends.map((value) => {
                const labelId = `list-label-${value}`;
                return (
                    <ListItem key={value} role={undefined} button >
                        <ListItemText id={labelId} primary={value} />
                        <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="comments">
                            <CommentIcon style={{color: '#993399'}}/>
                        </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                );
            })}
            </List>
        </Box>
    </>
    );
}


export default Users;
