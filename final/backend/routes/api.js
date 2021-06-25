const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid').v4;
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Room = require('../models/Room');

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
            password: bcryptPasswordHash
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
        return;
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
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
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

        /* Create new room */
        const newRoom = Room({
            roomId: roomId,
            roomName: roomName,
            roomPassword: roomPassword,
            users: [ currentUser._id ],
            messages: []
        });
        newRoom.save();

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
        res.status(400).json({
            status: 'failed',
            reason: 'UnknownError'
        });
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

        /* Check for duplicate room */
        const room = await Room.findOne({ roomName: roomName }).populate('users').exec();
        if (room === null) {
            res.status(400).json({
                status: 'failed',
                reason: 'RoomNameNotFound'
            });
            return;
        }
        
        const users = room.users;
        for (let user of users) {
            /* The user is already in the chat room -> no authentication is required  */
            if (user.username === username) {
                res.json({
                    status: 'success',
                    roomId: room.roomId
                });
            }
        }

        /* The user is not in the chat room -> password required  */
        const roomPassword = req.body.roomPassword;

        if (roomPassword === undefined) {
            res.json({
                status: 'success',
                passwordRequired: true
            });
            return;
        }

        /* Check the type of username and password */
        if (typeof roomPassword !== 'string') {
            res.status(400).json({
                status: 'failed',
                reason: 'TypeError'
            });
            return;
        }

        if (room.roomPassword !== roomPassword) {
            res.status(400).json({
                status: 'failed',
                reason: 'IncorrectRoomPassword'
            });
            return;
        }

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
        res.status(400).json({
            status: 'failed',
            reason: 'UnknownError'
        });
    }
});

module.exports = router;
