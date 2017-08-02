'use strict';

const logger = require('./logger')
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

/* ================================
 * Constants
 * ================================
 */
const ACCESS_LEVEL = {
    USER: 10,
    POWER_USER: 20,
    VOPEN_SERVICE: 30,
    MANAGER: 40,
    ADMIN: 50,
};

/* ================================
 * Schema
 * ================================
 */

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    accessLevel: { type: Number, default: ACCESS_LEVEL.USER },
    isDefault: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const credentialSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    key: String,            // VOpen access key
    secret: String,         // VOpen access secret
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const tokenSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String,
    value: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const topicSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    description: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

/* ================================
 * Models
 * ================================
 */
const User = mongoose.model('User', userSchema);
const Credential = mongoose.model('Credential', credentialSchema);
const Token = mongoose.model('Token', tokenSchema);
const Topic = mongoose.model('Topic', topicSchema);

/* ================================
 * Database
 * ================================
 */

function createDefaultUser() {
    User.findOne({ isDefault: true })
    .then((res) => {
        if (!res) {
            // create new user
            let defaultUser = new User({ firstName: 'Default', lastName: 'User', isDefault: true })
            defaultUser.save()
            .then((u) => {
                logger.info(`Created default user ${u.firstName} ${u.lastName}`);

                //  create user credentials
                let credentials = new Credential({
                    user: u.id,
                    key: uuidv4().replace(/-/gi, ''),
                    secret: uuidv4().replace(/-/gi, ''),
                });
                return credentials.save();
            })
            .then((c) => {
                logger.info(`Default user key: ${c.key}`);
                logger.info(`Default user secret: ${c.secret}`);
                logger.info(`Default user access level: ${defaultUser.accessLevel}`);
            });
        } else {
            logger.info(`Default user present`);
            Credential.findOne({ user: res.id })
            .then((c) => {
                logger.info(`Default user key: ${c.key}`);
                logger.info(`Default user secret: ${c.secret}`);
                logger.info(`Default user access level: ${res.accessLevel}`);
            });
        }
    })
    .catch((err) => {
        logger.error(err.message);
    });
}

const connection = function() {
    return new Promise((fulfill, reject) => {
        // set up connection
        mongoose.connect('mongodb://usersdb/vopen_users', { useMongoClient: true })
        .then((instance) => {
            logger.info('Connected to DB');
            createDefaultUser();
            fulfill(instance)
        })
        .catch((err) => {
            logger.error('MongoDB connection error:', err.message);
            reject(err);
        });
    });
}

module.exports = {
    ACCESS_LEVEL,
    connection,
    User,
    Credential,
    Token,
}
