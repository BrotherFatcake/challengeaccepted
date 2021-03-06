'use-strict';

const express = require('express');

const bodyParser = require('body-parser');

const passport = require('passport');

const jwt = require('jsonwebtoken');

const config = require('../config');

const router = express.Router();

const localAuth = passport.authenticate('local', { session: false });

const jwtAuth = passport.authenticate('jwt', { session: false });

//generate valid jwt
const createAuthToken = function (user) {

    return jwt.sign({ user }, config.JWT_SECRET,
        {
            subject: user.username,
            expiresIn: config.JWT_EXPIRE,
            algorithm: 'HS256'
        });
};


router.use(bodyParser.json());

//Login route, requires valid jwt
router.post('/login', localAuth, (req, res) => {
    const authToken = createAuthToken(req.user.cleanUp());
    res.json({ authToken });
});

router.post('/refresh', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({ authToken })
});

module.exports = { router };