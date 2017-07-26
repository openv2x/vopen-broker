'use strict';

const Promise = require('bluebird');
const debug = require('debug')('auth:server');
const http = require('http');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const DB = require('./db');
const logger = require('./logger');


/* ================================
 * Constants
 * ================================
 */
const PRIVATE_TOPIC_REGEX = /private\/[a-z0-9]{32}\/.+/g;
const PUBLIC_TOPIC_REGEX = /public\/.+/g;


/* ================================
 * Database
 * ================================
 */
DB.connection()
.then((instance) => setupServer())
.catch((err) => {});


/* ================================
 * Create app
 * ================================
 */
const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/auth/user', (req, res, next) => {
    let username = req.body.username;      // the name of the user
    let password = req.body.password;      // the password provided

    authenticateUser(username, password)
    .then((user) => {
        logger.info(`User ${user.firstName} ${user.lastName} is connecting...`);
        res.send('allow');
    })
    .catch((err) => {
        logger.error(err.message);
        res.send('deny');
    });
});

app.post('/auth/vhost', (req, res, next) => {
    let username = req.body.username;      // the name of the user
    let vhost = req.body.vhost;            // the name of the virtual host being accessed
    let ip = req.body.ip;                  // the client ip address
    res.send('allow');
});

app.post('/auth/resource', (req, res, next) => {
    let username = req.body.username;      // the name of the user
    let vhost = req.body.vhost;            // the name of the virtual host containing the resource
    let resource = req.body.resource;      // the type of resource (exchange, queue, topic)
    let name = req.body.name;              // the name of the resource
    let permission = req.body.permission;  // the access level to the resource (configure, write, read)

    if ('topic' === resource) {

        switch (permission) {
            case 'write':
                authorizeTopicPublish(username, name)
                .then(() => {
                    res.send('allow');
                })
                .catch((err) => {
                    logger.error(err.message);
                    res.send('deny');
                });
                break;
            case 'read':
                res.send('deny');
                break;
            default:
                res.send('deny');
                break;
        }
    } else {
        res.send('deny');
    }
    // logger.info(username, resource, name, permission)

});

app.post('/auth/topic', (req, res, next) => {
    let username = req.body.username;      // the name of the user
    let vhost = req.body.vhost;            // the name of the virtual host containing the resource
    let resource = req.body.resource;      // the type of resource (topic in this case)
    let name = req.body.name;              // the name of the exchange
    let permission = req.body.permission;  // the access level to the resource (write  read)
    let routingKey = req.body.routing_key; // the routing key of a published message (when the permission is write) or routing key of the queue binding (when the permission is read)
    res.send('allow');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    logger.error(err.message);
    res.status(err.status || 500);
    res.json({ status: 'error', errorMessage: err.message, data: {} });
});


/* ================================
 * Authorization and authentication
 * ================================
 */
function authenticateUser(key, secret) {
    return new Promise((fulfill, reject) => {
        DB.Credential.findOne({ key, secret })
        .populate('user')
        .exec()
        .then((credentials) => {
            if (!credentials) reject(new Error(`Invalid key or secret: ${key}`));
            else fulfill(credentials.user);
        })
        .catch((err) => {
            reject(err)
        });
    });
}

function authorizeTopicPublish(key, topic) {
    return new Promise((fulfill, reject) => {

        DB.Credential.findOne({ key })
        .populate('user')
        .exec()
        .then((credentials) => {

            let accessLevel = credentials.user.accessLevel;

            // validate topic format
            if (PUBLIC_TOPIC_REGEX.test(topic)) {
                reject(new Error(`Publish on public topic ${topic} rejected`));
            } else if (PRIVATE_TOPIC_REGEX.test(topic)) {
                if (accessLevel < DB.ACCESS_LEVEL.USER) {
                    reject(new Error('Insufficient access level'));
                } else {
                    // TODO: check key
                    fulfill();
                }
            } else {
                reject(new Error(`Topic does not match required schema: ${topic}`));
            }
        })
        .catch((err) => {
            reject(err);
        });

    });
}


/* ================================
 * Create HTTP server
 * ================================
 */
function setupServer() {
    const server = http.createServer(app);

    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error('Pipe requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error('Port is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    server.on('listening', () => {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        logger.info(`HTTP server listening on ${bind}`);
    });

    server.listen(3000);

}
