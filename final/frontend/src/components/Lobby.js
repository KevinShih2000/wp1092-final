import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import { makeStyles, useTheme } from '@material-ui/core/styles';

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
                aria-label="first page"
            >
            { theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon /> }
            </IconButton>
            <IconButton onClick={ handleBackButtonClick } disabled={ page === 0 } aria-label="previous page">
            { theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft /> }
            </IconButton>
            <IconButton
                onClick={ handleNextButtonClick }
                disabled={ page >= Math.ceil(count / rowsPerPage) - 1 }
                aria-label="next page"
            >
            { theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight /> }
            </IconButton>
            <IconButton
                onClick={ handleLastPageButtonClick }
                disabled={ page >= Math.ceil(count / rowsPerPage) - 1 }
                aria-label="last page"
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

function createData(roomName, calories) {
    return { roomName, calories };
}

const roomRows = [
    createData('Cupcake', 5),
    createData('Donut', 42),
    createData('Eclair', 22),
    createData('Frozen yoghurt', 59),
    createData('Gingerbread', 36),
    createData('Honeycomb', 40),
    createData('Ice cream sandwich', 7),
    createData('Jelly Bean', 35),
    createData('KitKat', 51),
    createData('Lollipop', 39),
    createData('Marshmallow', 38),
    createData('Nougat', 30),
    createData('Oreo', 43),
].sort((a, b) => (a.calories < b.calories ? -1 : 1));

const useStyles2 = makeStyles({
    table: {
        minWidth: 500,
        minHeight: 500,
    },
});

function Lobby() {
    const classes = useStyles2();
    const [page, setPage] = React.useState(0);
    const rowsPerPage = 7;

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, roomRows.length - page * rowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <TableContainer component={ Paper }>
            <Table className={ classes.table } aria-label="custom pagination table">
                <TableBody>
                {
                    (rowsPerPage > 0
                        ? roomRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : roomRows
                    ).map((row) => (
                        <TableRow key={ row.name }>
                            <TableCell component="th" scope="row">
                                { row.roomName }
                            </TableCell>
                            <TableCell style={ { width: 160 } } align="right">
                                { row.calories }
                            </TableCell>
                            <TableCell style={ { width: 160 } } align="right">
                                { row.fat }
                            </TableCell>
                            <TableCell style={ { width: 160 } } align="right">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
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
    );
}

export default Lobby;
