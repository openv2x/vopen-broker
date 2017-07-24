'use strict';

const debug = require('debug')('auth:server');
const http = require('http');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

/* ================================
 * Create app
 * ================================
 */
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/auth/user', (req, res, next) => {
    let username = req.body.username;      // the name of the user
    let password = req.body.password;      // the password provided
    res.send('allow');
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
    console.log(username, vhost, resource, name, permission)
    res.send('allow');
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
    console.error(err.message);
    res.status(err.status || 500);
    res.json({ status: 'error', errorMessage: err.message, data: {} });
});


/* ================================
 * Create HTTP server
 * ================================
 */
const server = http.createServer(app);
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error('Pipe requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('Port is already in use');
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
    debug('Listening on ' + bind);
});

server.listen(3000);
