'use strict';

const express = require('express');

const bodyParser = require('body-parser');

const { userInfoModel } = require('../models')

const router = express.Router();

const passport = require('passport');

const jwt = require('jsonwebtoken');

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

//GET USER DATA BY USERTOKEN
router.get('/:id', jwtAuth, (req, res) => {

    userInfoModel.findById(req.params.id)
        .then(user => {
            res.json(user.cleanUp())
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'unable to find id' });
        })
})


//GET USERTOKEN
router.get('/getuser/:username', (req, res) => {

    userInfoModel.findOne({ username: req.params.username })
        .then(user => {
            res.json(user.setToken())
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'unable to find user' });
        })
})

//POST TO CREATE NEW USER
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email'];


    const noField = requiredFields.find(field => !(field in req.body));

    if (noField) {
        return res.status(500).json(
            {
                code: 422,
                reason: 'ERROR',
                message: 'Field is not present',
                location: noField
            }).end();
    };

    const areStrings = ['username', 'password', 'firstName', 'lastName', 'email'];

    const notString = areStrings.find(field =>
        field in req.body && typeof req.body[field] !== 'string');

    if (notString) {
        const errMessage = `${field} is not of the correct type`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    const trimmedFields = ['username', 'password', 'email'];
    const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (notTrimmedFields) {
        const errMessage = `${notTrimmedFields} cannot start or end with whitespace`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    const userPassLength = {
        username: { min: 8, max: 30 },
        password: { min: 8, max: 60 }
    };

    const tooShort = Object.keys(userPassLength).find(field => 'min' in userPassLength[field] && req.body[field].trim().length < userPassLength[field].min);
    const tooLong = Object.keys(userPassLength).find(field => 'max' in userPassLength[field] && req.body[field].trim().length > userPassLength[field].max);

    if (tooShort || tooLong) {
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: tooShort
                ? `is required to be at least ${userPassLength[tooShort]
                    .min} characters long`
                : `Cannot be greater than ${userPassLength[tooLong]
                    .max} characters`,
            location: tooShort || tooLong
        });
    }

    let { username, password, firstName = '', lastName = '', email, lifeSteps, lifeDistance } = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    return userInfoModel.find({ username })
        .count()
        .then(count => {

            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ERROR',
                    message: 'User ID is not valid',
                    location: 'User ID: '
                });
            }


            return userInfoModel.hashPass(password);

        })
        .then(hash => {
            return userInfoModel.create({
                username,
                password: hash,
                firstName,
                lastName,
                email,
                lifeSteps,
                lifeDistance
            });
        })
        .then(user => {
            return res.status(201).json(user.cleanUp());
        })
        .catch(err => {
            if (err.reason === 'ERROR') {
                return res.status(err.code).json(err);
            }
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'something is broken' });
        })

})

//PUT TO UPDATE LIFE STATS

router.put('/update/:id', jwtAuth, jsonParser, (req, res) => {

    const requiredFields = ['id', 'lifeSteps' || 'lifeDistance'];

    const noField = requiredFields.find(field => !(field in req.body));

    if (noField) {
        return res.status(422).json(
            {
                code: 422,
                reason: 'ERROR',
                message: 'Field is not present',
                location: noField
            });
    }

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {

        const putErrMessage = `${req.params.id} and ${req.body.id} must match`
        console.error(putErrMessage)
        return res.status(400).send(putErrMessage);
    }


    const toUpdate = {};

    const updateAllowed = ['lifeSteps', 'lifeDistance'];

    updateAllowed.forEach(data => {
        if (data in req.body) {
            toUpdate[data] = req.body[data];
        }
    });

    userInfoModel.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true }, function () {
        return res.send(`${req.body.id} has been updated`)

    })

        .catch(err => {
            if (err.reason === 'ERROR') {
                return res.status(err.code).json(err);
            }
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'something is broken' });
        })

})



module.exports = router;