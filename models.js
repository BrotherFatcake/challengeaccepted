'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const exerStatsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    date: { type: Date },
    steps: { type: Number },
    distance: { type: Number },
    exertype: { type: String }

})

const userInfoSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    lifeSteps: { type: Number },
    lifeDistance: { type: Number }
})

exerStatsSchema.pre('findOne', function (next) {
    this.populate('user');
    next();
})

exerStatsSchema.pre('find', function (next) {
    this.populate('user');
    next();
})

exerStatsSchema.virtual('theUser').get(function () {
    return `${this.user.username}`.trim()
})

exerStatsSchema.methods.cleanUp = function () {
    return {
        id: this._id,
        user: this.theUser,
        date: this.date,
        steps: this.steps,
        distance: this.distance,
        exertype: this.exertype
    };
};

userInfoSchema.methods.cleanUp = function () {
    return {
        id: this._id,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        lifeSteps: this.lifeSteps,
        lifeDistance: this.lifeDistance
    };
};

userInfoSchema.methods.setToken = function () {
    return {
        id: this._id,
        lifeSteps: this.lifeSteps,
        lifeDistance: this.lifeDistance
    };
};

userInfoSchema.methods.valPass = function (pass) {
    return bcrypt.compare(pass, this.password);
};


userInfoSchema.statics.hashPass = function (pass) {
    return bcrypt.hash(pass, 10);
};

const exerStatsModel = mongoose.model('exerstats', exerStatsSchema);
const userInfoModel = mongoose.model('users', userInfoSchema);

module.exports = { exerStatsModel, userInfoModel };