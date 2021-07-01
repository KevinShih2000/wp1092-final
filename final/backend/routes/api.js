const express = require('express');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid').v4;
const jwt = require('jsonwebtoken');
const date = require('date-and-time');
const multer = require('multer');
const fetch = require('node-fetch');

const User = require('../models/User');
const Room = require('../models/Room');

const router = express.Router();
require('dotenv').config();

const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif') {
            cb(null, true)
        }
        else {
            cb(null, false);
            return cb(new Error('Only png, jpeg and gif are allowed'));
        }
    }
});

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
        const username = jwtData.username;
        const currentUser = await User.findOne({ username: username });
        res.json({
            status: 'success',
            username: username,
            avatar: currentUser.avatar
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
            avatar: '',
            status: true,
            friends: [],
            rooms: []
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
            status: 'success',
            avatar: credential.avatar
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
    const username = req.body.user;
    await User.updateOne({username: username}, {status: false})
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
        const currentUser = await User.findOne({ username: username });
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
        const newRoom_ = await newRoom.save();
        currentUser.rooms.push(newRoom_._id);
        currentUser.save();
        
        const io = req.app.get('socketio');

        io.on('connection', socket => {
            console.log(username + ' join room ' + roomName)
            socket.join(roomName);
            socket.on('disconnect', (reason) => {
                console.log(usename + 'leave room ' + roomName)
                socket.leave(roomName);
            })
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

router.post('/leaveRoom', async (req, res, next) => {
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
        const user = await User.findOne({ username: username });
        if (user === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotFound'
            });
            return;
        }

        const userResult = await User.findOneAndUpdate({ username: username }, { '$pullAll': { 'rooms': [room._id] } } );
        console.log(userResult);
        userResult.save();
        const roomResult = await Room.findOneAndUpdate({ roomName: roomName }, { '$pullAll': { 'users': [user._id] } } );
        console.log(roomResult);
        roomResult.save();
        res.json({
            status: 'success',
        });
    }
    catch (error) {
        console.log(error);
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
                    console.log(username + ' join room ' + roomName)
                    socket.join(roomName);
                    socket.on('disconnect', (reason) => {
                        console.log(username + ' leave room ' + roomName)
                        socket.leave(roomName);
                    })
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

        const currentUser = await User.findOne({ username: username });
        if (currentUser === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'UserNotFound'
            });
            return;
        }
        room.users.push(currentUser._id);
        const room_ = await room.save();
        currentUser.rooms.push(room_._id);
        currentUser.save();

        const io = req.app.get('socketio');
        io.on('connection', socket => {
            console.log(username + ' join room ' + roomName)
            socket.join(roomName);
            socket.on('disconnect', (reason) => {
                console.log(username + ' leave room ' + roomName)
                socket.leave(roomName);
            })
        })
        res.json({
            status: 'success',
            roomId: room.roomId
        });

    }
    catch (error) {
        console.log(error);
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
            avatar: currentUser.avatar,
            roomName: roomName
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

router.post('/upload', upload.single('image'), async (req, res, next) => {
    const base64Image = req.file.buffer.toString('base64');
    const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            'Authorization': 'Client-ID 358e28c786ca56c'
        },
        body: base64Image
    });
    const data = await response.json();
    const avatarLink = data.data.link;
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

    const currentUser = await User.findOne({ username: username });
    if (currentUser === null) {
        res.status(400).json({
            status: 'failed',
            reason: 'UserNotFound'
        });
        return;
    }
    currentUser.avatar = avatarLink;
    currentUser.save();

    res.json({
        status: 'success',
        avatar: avatarLink
    });
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

router.post('/changePassword', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        });
        return;
    }
    const username = req.body.name;
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

    /* Check the type of username and password */
    if (typeof username !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    if (typeof newPassword !== 'string' || typeof oldPassword !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    let credential;
    /* Check for duplicate user */
    try {
        credential = await User.findOne({ username: username });
        // console.log(credential);

        if (credential === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'InvalidUsernameOrPassword'
            });
            return;
        }
        
        const passwordMatch = await bcrypt.compare(oldPassword, credential.password);
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

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        console.log("here2")
        return;
    }

    /* Generate bcrypt password hash */
    const saltRounds = 10;
    const bcryptPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    console.log(typeof bcryptPasswordHash);
    /* Store password hash into database */
    try {
        credential.password = bcryptPasswordHash;
        credential.save();

        /* return success message if everything is fine */
        res.json({
            status: 'success',
        });
        return;
    }
    catch (error) {
        // console.log(error)
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
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
    const friend = req.body.friend;
    if (username === '') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }

    /* Find user */
    try {
        const rawdata = await User.find();
        if(rawdata.length === 0){
            res.json({
                status: 'not found',
            });
            return;
        }
        const data = rawdata.filter(e => e.username.includes(friend))
        if(data.length === 0){
            res.json({
                status: 'not found',
            });
            return;
        }
        let result = data.filter(e => {
            return (e.username !== username);
        })
        console.log(result);
        if (result !== null) {
            if(result.length !== 0){
                result = result.sort((a,b) => a.username.length - b.username.length)
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
            res.json({
                status: 'success',
                body: result,
            });
            return;

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
        //console.log("u", updatefriend)
        await User.updateOne({username: username}, {friends: updatefriend})
        //console.log(await User.findOne({username: username}))
        const result = updatefriend.map( f => {
            return([f.username, f.status])
        })

        //console.log(result)
        res.json({
            status: 'success',
            body: result,
        });
        return;

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
        console.log(result)
            res.json({
                status: 'success',
                body: result,
            });
            return;

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.get('/rooms/get', async (req, res, next) => {
   
    /* Check for empty request */   
    if (!req.query) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.query.user;

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
        
        const user = await User.findOne({username: username},{rooms:1}).populate({
            path:'rooms', populate:{ path: 'messages.user'}
        }).exec();
        
        let result = [];
        user.rooms.map(r => {
            if(r.messages.length != 0){
                let lastMsg = r.messages[r.messages.length-1];
                
                result.push({
                    roomName: r.roomName,
                    memberNum: r.users.length,
                    lastMessage: {
                        user: lastMsg.user.username,
                        message: lastMsg.message,
                    }
                });
            }
            else{
                result.push({
                    roomName: r.roomName,
                    memberNum: r.users.length,
                    lastMessage: {
                        user: " ",
                        message: " ",
                    }
                });
            }
            
            
        })

        res.send(result);
        return;

    }
    catch (error) {
        console.log(error)
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.post('/online', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.body.user;
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
        await User.updateOne({username: username}, {status: true})
        //console.log(await User.findOne({username: username}))
            res.json({
                status: 'success',
            });
            return;

    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }
});

router.post('/friends/info', async (req, res, next) => {
    /* Check for empty request */
    if (!req.body) {
        res.status(400).json({
            status: 'failed',
            reason: 'EmptyBodyError'
        }); return;
    }

    const username = req.body.user;
    const friend = req.body.friend;

    /* Check the type of username */
    if (typeof friend !== 'string') {
        res.status(400).json({
            status: 'failed',
            reason: 'TypeError'
        });
        return;
    }
    
    /* Find user */
    try {
        const rawdata = await User.findOne({username: friend}).populate('rooms').exec();
        const len = rawdata.rooms.length;
        const room = len !== 0 ? rawdata.rooms[len-1].roomName : "No room joined ..."
        const friendinfo = {
            name: rawdata.username,
            status: rawdata.status ? "online" : "offline",
            gender: rawdata.gender ? rawdata.gender : "No info ...",
            birthday: rawdata.birthday ? rawdata.birthday : "No info ...",
            email: rawdata.email ? rawdata.email : "No info ...",
            company: rawdata.company ? rawdata.company : "No info ...",
            room: room
        }
        //console.log(await User.findOne({username: username}))
            res.json({
                status: 'success',
                body: friendinfo
            });
            return;

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
