import { useState } from 'react';
import { Redirect } from 'react-router-dom';

import PropTypes from 'prop-types';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import MuiAlert from '@material-ui/lab/Alert';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import axios from 'axios';

const useStyles1 = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5),
    },
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function TablePaginationActions(props) {
    const classes = useStyles1();
    const theme = useTheme();
    const { count, page, rowsPerPage, onChangePage } = props;

    const handleFirstPageButtonClick = (event) => {
        onChangePage(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onChangePage(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onChangePage(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <div className={ classes.root }>
            <IconButton
                onClick={ handleFirstPageButtonClick }
                disabled={ page === 0 }
                aria-label='first page'
            >
            { theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon /> }
            </IconButton>
            <IconButton onClick={ handleBackButtonClick } disabled={ page === 0 } aria-label='previous page'>
            { theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft /> }
            </IconButton>
            <IconButton
                onClick={ handleNextButtonClick }
                disabled={ page >= Math.ceil(count / rowsPerPage) - 1 }
                aria-label='next page'
            >
            { theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight /> }
            </IconButton>
            <IconButton
                onClick={ handleLastPageButtonClick }
                disabled={ page >= Math.ceil(count / rowsPerPage) - 1 }
                aria-label='last page'
            >
            { theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon /> }
            </IconButton>
        </div>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

function createData(roomName, lastMessage, memberNum) {
    return { roomName, lastMessage, memberNum};
}

const useStyles2 = makeStyles((theme) => ({
    table: {
        minWidth: 500,
        minHeight: 500,
    },
    head: {
        backgroundColor: '#1976d2',
        color: theme.palette.common.white,
    },
    highlight: {
        backgroundColor: 'rgba(255, 229, 100, 0.2)'
    },
    body: {
        fontSize: 14,
    },
}));

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

function Lobby({ currentRoom, setCurrentRoom, myRooms }) {
    const classes = useStyles2();
    const [page, setPage] = useState(0);
    const [roomId, setRoomId] = useState('');
    const [showCircularProgress, setShowCircularProgress] = useState(false);
    const [showJoinRoomError, setShowJoinRoomError] = useState(false);
    const [joinRoomErrorMessage, setJoinRoomErrorMessage] = useState('');
    const rowsPerPage = 5;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, (myRooms === null ? 0 : myRooms.length) - page * rowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    function handleCloseErrorMessage() {
        setShowJoinRoomError(false);
        setJoinRoomErrorMessage('');
    }

    async function joinRoom(roomName) {
        console.log("here")
        setShowCircularProgress(true);
        try {
            const result = await instance.post('/joinRoom', { roomName }, { withCredentials: true });
            const data = result.data;
            setShowCircularProgress(false);
            if (data.status === 'success') {
                console.log("here1")
                setCurrentRoom({ roomName: roomName, roomId: data.roomId });
                setRoomId(data.roomId);
            }
        }
        catch (error) {
            console.log(error);
            if (error.message === 'Network Error') {
                setShowJoinRoomError(true);
                setJoinRoomErrorMessage('Backend is unreachable. Please contact the administrator.');
            }
            else if (/^timeout of [0-9]+ms exceeded$/.test(error.message)) {
                setShowJoinRoomError(true);
                setJoinRoomErrorMessage('Connection Timeout. Please contact the administrator.');
            }
            else if (error.response) {
                const data = error.response.data;
                if (data.status === 'failed') {
                    if (data.reason === 'RoomNameNotFound') {
                        setShowJoinRoomError(true);
                        setJoinRoomErrorMessage('Invalid room name.');
                    }
                    else if (data.reason === 'DatabaseFailedError') {
                        setShowJoinRoomError(true);
                        setJoinRoomErrorMessage('Database error. Please contact the administrator.');
                    }
                    else if (data.reason === 'EmptyBodyError' || data.reason === 'TypeError') {
                        setShowJoinRoomError(true);
                        setJoinRoomErrorMessage('Invalid response.');
                    }
                }
                else {
                    setShowJoinRoomError(true);
                    setJoinRoomErrorMessage('Unknown error. Please contact the administrator.');
                }
            }
            else {
                setShowJoinRoomError(true);
                setJoinRoomErrorMessage('Unknown error. Please contact the administrator.');
            }
            setShowCircularProgress(false);
        }
    }

    return (
        roomId
        ? <Redirect to={ '/room?id=' + encodeURI(roomId) } />
        : <>
            <TableContainer component={ Paper }>
                <Table className={ classes.table } aria-label='custom pagination table'>
                    <TableHead>
                        <TableRow>
                            <TableCell className={ classes.head }>
                                <Typography variant='h6' className={ classes.title }>
                                    Room Name
                                </Typography>
                            </TableCell>
                            <TableCell className={ classes.head } align='right'>
                                <Typography variant='h6' className={ classes.title }>
                                    Last Message
                                </Typography>
                            </TableCell>
                            <TableCell className={ classes.head } align='center'>
                                <Typography variant='h6' className={ classes.title }>
                                    User Nums
                                </Typography>
                            </TableCell>
                            <TableCell className={ classes.head } align='center'>
                                <Typography variant='h6' className={ classes.title }>
                                    Join
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        (myRooms !== null && myRooms.length !== 0) ? myRooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <TableRow key={ row.roomName }>
                                <TableCell component='th' scope='row'>
                                    { row.roomName }
                                </TableCell>
                                <TableCell style={ { maxWidth: 160, color: '#65676b', overflow: 'hidden', textOverflow: 'ellipsis' } } align='right'>
                                    { row.lastMessage.user + ': ' }<br />
                                    { row.lastMessage.message }
                                </TableCell>
                                <TableCell style={ { maxWidth: 160 } } align='center'>
                                    { row.memberNum }
                                </TableCell>
                                <TableCell style={ { maxWidth: 160 } } align='center'>
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        size='small'
                                        onClick={ () => joinRoom(row.roomName) }
                                    >
                                        join
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                        : <TableRow>
                            <TableCell component='th' scope='row'>
                                No rooms.
                            </TableCell>
                        </TableRow>
                    }
                    {
                        emptyRows > 0 && (
                            <TableRow style={ { height: 53 * emptyRows } }>
                                <TableCell colSpan={ 6 } />
                            </TableRow>
                        )
                    }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                colSpan={ 3 }
                                count={ myRooms === null ? 0 : myRooms.length }
                                rowsPerPage={ rowsPerPage }
                                rowsPerPageOptions={ [] }
                                page={ page }
                                onChangePage={ handleChangePage }
                                ActionsComponent={ TablePaginationActions }
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            <Backdrop className={ classes.backdrop } open={ showCircularProgress }>
                <CircularProgress color='primary' className={ classes.progress } />
            </Backdrop>
            <Snackbar open={ showJoinRoomError } autoHideDuration={ 6000 } onClose={ handleCloseErrorMessage }>
                <Alert onClose={ handleCloseErrorMessage } severity='error'>
                {
                    joinRoomErrorMessage
                }
                </Alert>
            </Snackbar>
        </>
    );
}

export default Lobby;
