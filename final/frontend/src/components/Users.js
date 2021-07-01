import { useState, useEffect } from 'react';
//import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import Backdrop from '@material-ui/core/Backdrop';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputBase from '@material-ui/core/InputBase';
//import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import SearchBar from "material-ui-search-bar";
//import Snackbar from '@material-ui/core/Snackbar';
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

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 60000
});

function createData(name, status) {
  return { name, status };
}

const friends = [
    createData('Cupcake', 'online'),
    createData('Donut', 'online'),
    createData('Eclair', 'online'),
    createData('Frozen yoghurt', 'online'),
    createData('Gingerbread', 'offline'),
    createData('Honeycomb', 'offline'),
    createData('Ice cream sandwich', 'offline'),
    createData('Jelly Bean', 'offline'),
];

const useStyles = makeStyles((theme) => ({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 400,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  }));

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

const useStyles2 = makeStyles((theme) => ({
    table: {
        minWidth: 500,
        minHeight: 500,
    },
    head: {
        backgroundColor: '#297edd',
        color: theme.palette.common.white,
    },
    highlight: {
        backgroundColor: 'rgba(255, 229, 100, 0.2)'
    },
    body: {
        fontSize: 14,
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
      },
    iconButton: {
        padding: 10,
    },
}));

function Users({instance, username, myfriends, setmyfriends}) {
    const classes = useStyles2();
    const [page, setPage] = useState(0);
    const [value, setValue] = useState('');
    const [searchresult, setSearchresult] = useState([]);
    const [showCircularProgress, setShowCircularProgress] = useState(false);
    const rowsPerPage = 5;

    const emptyRows = (searchresult.length === 0 ?
    (rowsPerPage - Math.min(rowsPerPage, friends.length - page * rowsPerPage))
    : (rowsPerPage - Math.min(rowsPerPage, searchresult.length - page * rowsPerPage)))

    //console.log(username)
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleSearch = async () => {
        if(value){
            const result = await instance.post('/friends/search', { user: username, friend: value }, { withCredentials: true });
            console.log(result.data)
            if(result.data.status === 'success'){
                setSearchresult(result.data.body);
            }
            else{
                console.log("e")
                setSearchresult(["No users found"]);
            }
            //console.log(result)
        }
    }

    const handleFollow = async (friend) => {
        const newfriends = await instance.post('/friends/follow', { user: username, friend: friend}, { withCredentials: true });
        //console.log(newfriends.data.body)
        setmyfriends(newfriends.data.body);
    }

    const handleUnfollow = async (friend) => {
        const newfriends = await instance.post('/friends/unfollow', { user: username, friend: friend }, { withCredentials: true });
        //console.log(newfriends.data.body)
        setmyfriends(newfriends.data.body);
    }

    return (
    <>
        <Box boxShadow={1}>
            <SearchBar
                value={value}
                onChange={(newValue) => setValue(newValue)}
                onRequestSearch={handleSearch}
                placeholder='Find users ...'
            />
        </Box>
        <Box boxShadow={1}>
        <TableContainer component={ Paper } style={{marginTop: 5}}>
          <Table className={ classes.table } aria-label='custom pagination table'>
              <TableHead>
                  <TableRow>
                      <TableCell className={ classes.head }>
                          <Typography className={ classes.title } style={{fontWeight: 'bold'}}>
                              User Name
                          </Typography>
                      </TableCell>
                      <TableCell className={ classes.head } >
                          <Typography className={ classes.title } style={{fontWeight: 'bold'}}>
                              Status
                          </Typography>
                      </TableCell>
                      <TableCell className={ classes.head } >
                          <Typography className={ classes.title } style={{fontWeight: 'bold'}}>
                              Follow
                          </Typography>
                      </TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              { searchresult[0] === "No users found" ? (
                  <TableRow key='Search'>
                    <TableCell component='th' scope='row' >
                        <Typography>
                            No users found ...
                        </Typography>
                    </TableCell>
                  </TableRow>
                ) : searchresult.length !== 0 ? 
                searchresult.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={ row.name }>
                        <TableCell component='th' scope='row'>
                            { row.username }
                        </TableCell>
                        <TableCell style={ { maxWidth: 160 } } >
                            { row.status ? "online" : "offline" }
                        </TableCell>
                        <TableCell style={ { maxWidth: 160 } } >
                            {
                                myfriends !== null && (myfriends.findIndex(x => {
                                    //console.log(x[0] === row.username)
                                    return (x[0] === row.username)
                                }) === -1 ? (
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        size='small'
                                        onClick={() => handleFollow(row.username)}
                                    >
                                        follow
                                    </Button>
                                ) : (
                                    <Button
                                        variant='outlined'
                                        color='secondary'
                                        size='small'
                                        onClick={() => handleUnfollow(row.username)}
                                    >
                                        unfollow
                                    </Button>
                                ))
                            }
                            
                        </TableCell>
                    </TableRow>
                )): (<TableRow key='Search'>
                        <TableCell component='th' scope='row' >
                            <Typography style={{fontWeight: 'bold'}}>
                                Search for users ...
                            </Typography>
                        </TableCell>
                    </TableRow>
                )
                
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
                          count={ (searchresult.length !== 0 && searchresult[0] !== "No users found") ? searchresult.length : 0 }
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
      </Box>
    </>
    );
}


export default Users;
