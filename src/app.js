require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
// Testing until we have a router that needs requireAuth
const requireAuth = require('./middleware/jwt-auth');

const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');

const app = express();
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.use('/api/login', authRouter);
app.use('/api/users', usersRouter);

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'Server error' } };
    } else {
        response = { error: error.message };
    };
    res.status(500).json(response);
});

app.get('/api/test/*', (req, res) => {
    res.json({ok: true});
});

// Testing until we have a router that needs requireAuth
app.get('/api/auth-test', requireAuth, (req, res) => {
    res.json({message: 'You did it'});
});

module.exports = app;
