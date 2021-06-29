const express = require('express');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid').v4;
const jwt = require('jsonwebtoken');
const date = require('date-and-time');

const User = require('../models/User');
const Room = require('../models/Room');

const router = express.Router();
require('dotenv').config();

router.post('/sessionLogin', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }

    /* Check for cookie */
    if (!req.cookies) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotLogin'
        });
        return;
    }

    try {
        const jwtToken = req.cookies.jwt;
        if (!jwtToken) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotLogin'
            });
            return;
        }

        const jwtData = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        res.json({
            status: 'success',
            username: jwtData.username
        });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidJWT'
            });
            return;
        }
        else {
            res.status(400).json({
                status: 'failed',
                reason: 'UnknownError'
            });
            return;
        }
    }
});
router.post('/checkname', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    /* Check the type of username and password */
    const username = req.body.username;
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }

    /* Check for duplicate user */
    try {
        const result = await User.findOne({ username: username });
        if (result !== null) {
            res.status(400).json({
                status: 'failed',
                reason: 'DuplicateUserError'
            });
            return;
        }

        /* return success message if everything is fine */
        res.json({
            status: 'success',
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.post('/signup', async (req, res, next) => {

    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }
    const username = req.body.username;
    const password = req.body.password;

    /* Check the type of username and password */
    if (typeof username !== 'string' || typeof password !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }

    /* Check emptiness of username and password */
    if (username === '' || password === '') {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyValueError'
        });
        return;
    }

    /* Check for duplicate user */
    try {
        const duplicateUser = await User.findOne({ username: username });
        if (duplicateUser !== null) {
            res.status(400).json({
                status: 'failed',
                reason: 'DuplicateUserError'
            });
            return;
        }
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }

    /* Generate bcrypt password hash */
    const saltRounds = 10;
    const bcryptPasswordHash = await bcrypt.hash(password, saltRounds);

    /* Store username and password hash into database */
    try {
        await User.create({
            username: username,
            password: bcryptPasswordHash,
            status: false,
            friends: [],
            avatar: ''
        });

        /* return success message if everything is fine */
        res.json({
            status: 'success',
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
    }
});

router.post('/login', async (req, res, next) => {

    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }
    const username = req.body.username;
    const password = req.body.password;

    /* Check the type of username and password */
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    if (typeof password !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }

    /* Check for duplicate user */
    try {
        const credential = await User.findOne({ username: username });

        if (credential === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidUsernameOrPassword'
            });
            return;
        }
        
        const passwordMatch = await bcrypt.compare(password, credential.password);
        if (!passwordMatch) {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidUsernameOrPassword'
            });
            return;
        }
        const jwtToken = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('jwt', jwtToken, { 
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        res.json({
            status: 'success'
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
    }
});

router.post('/logout', async (req, res, next) => {

    /* Check for cookie */
    if (!req.cookies) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotLogin'
        });
        return;
    }

    res.clearCookie('jwt');
    res.json({
        status: 'success'
    });
});

router.post('/createRoom', async (req, res, next) => {

    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }

    /* Check for cookie */
    if (!req.cookies) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotLogin'
        });
        return;
    }

    try {
        const jwtToken = req.cookies.jwt;
        if (!jwtToken) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotLogin'
            });
            return;
        }

        const jwtData = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        const username = jwtData.username;
        const roomName = req.body.roomName;
        const roomPassword = req.body.roomPassword;

        /* Check the type of username and password */
        if (typeof username !== 'string' || typeof roomName !== 'string' || typeof roomPassword !== 'string') {
            res.status(400).json({
                status: 'failed',
                reason: 'TypeError'
            });
            return;
        }
        if (!username || !roomName || !roomPassword) {
            res.status(400).json({
                status: 'failed',
                reason: 'EmptyValueError'
            });
            return;
        }

        /* Check for duplicate room */
        const duplicateRoom = await Room.findOne({ roomName: roomName });
        if (duplicateRoom !== null) {
            res.status(400).json({
                status: 'failed',
                reason: 'DuplicateRoomName'
            });
            return;
        }

        /* Retrieve user _id */
        const currentUser = await User.findOne({ username: username }, { _id: 1 });
        if (currentUser === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotFound'
            });
            return;
        }

        const roomId = uuidv4();

        /* Generate bcrypt password hash */
        const saltRounds = 10;
        const bcryptRoomPasswordHash = await bcrypt.hash(roomPassword, saltRounds);

        /* Create new room */
        const newRoom = Room({
            roomId: roomId,
            roomName: roomName,
            roomPassword: bcryptRoomPasswordHash,
            users: [ currentUser._id ],
            messages: []
        });
        newRoom.save();
        
        const io = req.app.get('socketio');

        io.on('connection', socket => {
            console.log('OK3');
            socket.join(roomName);
        })

        res.json({
            status: 'success',
            roomId: roomId
        });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidJWT'
            });
            return;
        }
        else {
            res.status(400).json({
                status: 'failed',
                reason: 'DatabaseFailedError'
            });
        }
    }
});

router.post('/joinRoom', async (req, res, next) => {

    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }

    /* Check for cookie */
    if (!req.cookies) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotLogin'
        });
        return;
    }

    try {
        const jwtToken = req.cookies.jwt;
        if (!jwtToken) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotLogin'
            });
            return;
        }

        const jwtData = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        const username = jwtData.username;
        const roomName = req.body.roomName;

        /* Check the type of username and password */
        if (typeof username !== 'string' || typeof roomName !== 'string') {
            res.status(400).json({
                status: 'failed',
                reason: 'TypeError'
            });
            return;
        }

        /* Check for non-existent room */
        const room = await Room.findOne({ roomName: roomName }).populate('users').exec();
        if (room === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'RoomNameNotFound'
            });
            return;
        }
        
        const users = room.users;

        /* The user is already in the chat room -> no authentication is required  */
        for (let user of users) {
            if (user.username === username) {

                const io = req.app.get('socketio');

                io.on('connection', socket => {
                    console.log('OK1');
                    socket.join(roomName);
                })

                res.json({
                    status: 'success',
                    roomId: room.roomId
                });
                return;
            }
        }

        /* The user is not in the chat room -> password required  */
        const roomPassword = req.body.roomPassword;

        /* No password specified -> require user to enter password  */
        if (roomPassword === undefined) {
            res.json({
                status: 'success',
                passwordRequired: true
            });
            return;
        }

        if (typeof roomPassword !== 'string') {
            res.status(400).json({
                status: 'failed',
                reason: 'TypeError'
            });
            return;
        }

        /* Password specified -> check the correctness of password */
        const passwordMatch = await bcrypt.compare(roomPassword, room.roomPassword);
        if (!passwordMatch) {
            res.status(400).json({
                status: 'failed',
                reason: 'IncorrectRoomPassword'
            });
            return;
        }

        const currentUser = await User.findOne({ username: username }, { _id: 1 });
        if (currentUser === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotFound'
            });
            return;
        }
        room.users.push(currentUser._id);
        room.save();

        const io = req.app.get('socketio');
        io.on('connection', socket => {
            console.log('OK2');
            socket.join(roomName);
        })

        res.json({
            status: 'success',
            roomId: room.roomId
        });

    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidJWT'
            });
            return;
        }
        else {
            res.status(400).json({
                status: 'failed',
                reason: 'DatabaseFailedError'
            });
        }
    }
});

router.post('/messages', async (req, res, next) => {

    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }

    /* Check for cookie */
    if (!req.cookies) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotLogin'
        });
        return;
    }

    try {
        const jwtToken = req.cookies.jwt;
        if (!jwtToken) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotLogin'
            });
            return;
        }

        const jwtData = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        const username = jwtData.username;
        const roomName = req.body.roomName;

        /* Check the type of username and password */
        if (typeof username !== 'string' || typeof roomName !== 'string') {
            res.status(400).json({
                status: 'failed',
                reason: 'TypeError'
            });
            return;
        }

        /* Check for non-existent room */
        const room = await Room.findOne({ roomName: roomName }).populate('users').populate('messages.user').exec();
        if (room === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'RoomNameNotFound'
            });
            return;
        }
        
        const users = room.users;

        /* The user is already in the chat room -> no authentication is required  */
        for (let user of users) {
            if (user.username === username) {
                res.json({
                    status: 'success',
                    messages: room.messages.map(m => {
                        return {
                            name: m.user.username,
                            message: m.message,
                            timestamp: m.timestamp,
                            avatar: m.user.avatar
                        }
                    })
                });
                return;
            }
        }
        res.status(400).json({
            status: 'failed',
            reason: 'RoomAccessDenied'
        });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidJWT'
            });
            return;
        }
        else {
            res.status(400).json({
                status: 'failed',
                reason: 'DatabaseFailedError'
            });
        }
    }
});

router.post('/send', async (req, res, next) => {

    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }

    /* Check for cookie */
    if (!req.cookies) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotLogin'
        });
        return;
    }

    try {
        const jwtToken = req.cookies.jwt;
        if (!jwtToken) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotLogin'
            });
            return;
        }

        const jwtData = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        const username = jwtData.username;
        const roomName = req.body.roomName;
        const messageBody = req.body.message;

        /* Check the type of username and password */
        if (typeof username !== 'string' || typeof roomName !== 'string' || typeof messageBody !== 'string') {
            res.status(400).json({
                status: 'failed',
                reason: 'TypeError'
            });
            return;
        }

        /* Check for non-existent room */
        const room = await Room.findOne({ roomName: roomName }).populate('users').exec();
        if (room === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'RoomNameNotFound'
            });
            return;
        }
        
        const users = room.users;
        let userInRoom = false;
        for (let user of users) {
            if (user.username === username) {
                userInRoom = true;
                break;
            }
        }
        if (!userInRoom) {
            res.status(400).json({
                status: 'failed',
                reason: 'RoomAccessDenied'
            });
            return;
        }

        const currentUser = await User.findOne({ username: username });
        if (currentUser === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotFound'
            });
            return;
        }
        const timestamp = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
        const message = {
            user: currentUser._id,
            message: messageBody,
            timestamp: timestamp,
        };
        room.messages.push(message);
        room.save();

        const io = req.app.get('socketio');

        io.to(roomName).emit('newMessage', {
            name: username,
            message: messageBody,
            timestamp: timestamp,
            avatar: currentUser.avatar
        });

        res.json({
            status: 'success'
        });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidJWT'
            });
            return;
        }
        else {
            res.status(400).json({
                status: 'failed',
                reason: 'DatabaseFailedError'
            });
        }
    }
});

router.post('/setting', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    /* Check the type of username */
    const username = req.body.name;
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    
    const user = await User.findOne({ username:username });
    if(!user) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotFound'
        });
        return;
    }
    else{
        user.gender = req.body.gender;
        user.birthday = req.body.birthday;
        user.email = req.body.email;
        user.company = req.body.company;
        user.save()

        res.json({
            status: 'success',
        });
        return;

    }
});

router.get('/getUserInfo', async (req, res, next) => {
    /* Check for empty request */
    if (!req.query) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.query.name;
    const user = await User.findOne({ username:username });
    // console.log(user);
    if(!user) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotFound'
        });
        return;
    }
    else{
        res.send({
            name: user.username,
            gender: user.gender,
            birthday: user.birthday,
            email: user.email,
            company: user.company,
        })
    }
});

router.post('/friends/search', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    /* Check the type of username */
    const username = req.body.user;
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }

    /* Find user */
    try {
        const rawdata = await User.find();
        const result = rawdata.filter(e => e.username.includes(username))
        if (result !== null) {
            res.json({
                status: 'success',
                body: result,
            });
            return;
        }
        else{
            res.json({
                status: 'not found',
            });
            return;
        }

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.post('/friends/follow', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.body.user;
    const friend = req.body.friend;
    //console.log(username, friend)

    /* Check the type of username */
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    
    /* Find user */
    try {
        const rawdata = await User.findOne({username: username}).populate('friends').exec();
        const newfriend = await User.findOne({username: friend});
        const updatefriend = [...rawdata.friends, newfriend]
        await User.updateOne({username: username}, {friends: updatefriend})
        //console.log(await User.findOne({username: username}))
        const result = updatefriend.map(f => {
            return([f.username, f.status])
        })

        console.log("follow", result)
        if (result.length !== 0) {
            res.json({
                status: 'success',
                body: result,
            });
            return;
        }
        else{
            res.json({
                status: 'not found',
            });
            return;
        }

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.post('/friends/unfollow', async (req, res, next) => {
    /* Check for empty request */   
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.body.user;
    const friend = req.body.friend;

    /* Check user name */
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    
    /* Find user */
    try {
        const rawdata = await User.findOne({username: username}).populate('friends').exec();
        const updatefriend = [...rawdata.friends];
        updatefriend.splice(updatefriend.findIndex(f => f.username === friend), 1)
        console.log("u", updatefriend)
        await User.updateOne({username: username}, {friends: updatefriend})
        //console.log(await User.findOne({username: username}))
        const result = updatefriend.map( f => {
            return([f.username, f.status])
        })

        console.log(result)
        if (result.length !== 0) {
            res.json({
                status: 'success',
                body: result,
            });
            return;
        }
        else{
            res.json({
                status: 'not found',
            });
            return;
        }

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.post('/friends/get', async (req, res, next) => {
    /* Check for empty request */   
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.body.user;

    /* Check user name */
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    
    /* Find user */
    try {
        const rawdata = await User.findOne({username: username}).populate('friends').exec();
        const newfriends = [...rawdata.friends];
        const result = newfriends.map( f => {
            return([f.username, f.status])
        })

        console.log("get", result)
        if (result.length !== 0) {
            res.json({
                status: 'success',
                body: result,
            });
            return;
        }
        else{
            res.json({
                status: 'not found',
            });
            return;
        }

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

module.exports = router;
