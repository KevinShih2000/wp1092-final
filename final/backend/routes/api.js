const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

require('dotenv').config();

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
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }

    /* return success message if everything is fine */
    res.json({
        status: 'success',
    });
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
    }
    catch (error) {
        res.status(400).json({
            status: 'failed',
            reason: 'DatabaseFailedError'
        });
        return;
    }

    /* return success message if everything is fine */
    res.json({
        status: 'success',
    });
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

module.exports = router;
