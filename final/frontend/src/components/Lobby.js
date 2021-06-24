import { useState } from 'react';
import PropTypes from 'prop-types';
import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import axios from 'axios';

const useStyles1 = makeStyles((theme) => ({
    root: {
        flexShrink: 0,
        marginLeft: theme.spacing(2.5),
    },
}));

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

const roomRows = [
    createData('Cupcake', { user: 'pekora', message: '好油喔 peko' }, 38),
    createData('Donut', { user: 'pekora', message: '我不看這些的 peko' }, 33),
    createData('Eclair', { user: 'coco', message: 'Viva la coco' }, 17),
    createData('Frozen yoghurt', {user: 'gura', message: 'A' }, 41),
    createData('Gingerbread', { user: 'maimoto', message: '火 舞元 火' }, 19),
    createData('Honeycomb', { user: 'towa', message: 'TMT' }, 14),
    createData('Ice cream sandwich', { user: 'DD', message: 'DD' }, 10),
    createData('Jelly Bean', { user: 'Rick', message: 'Never gonna give U up' }, 0),
];

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

function Lobby({ currentRoom, setCurrentRoom }) {
    const classes = useStyles2();
    const [page, setPage] = useState(0);
    const [showCircularProgress, setShowCircularProgress] = useState(false);
    const rowsPerPage = 5;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, roomRows.length - page * rowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const joinRoom = async (roomName) => {
        setCurrentRoom(roomName);
        setShowCircularProgress(true);
        const result = await instance.post('/room', null, { withCredentials: true });
        const data = result.data;
        setShowCircularProgress(false);
        if (data.status === 'success') {
        }
    }

    return (
        <>
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
                        roomRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
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
                                count={ roomRows.length }
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
        </>
    );
}

export default Lobby;
