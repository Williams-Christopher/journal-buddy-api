require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');

const requireAuth = require('./middleware/jwt-auth');

const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const journalEntriesRouter = require('./journal-entries/journal-entries-router');
const shareRouter = require('./share/share-router');
const metricsRouter = require('./metrics/metrics-router');

const app = express();
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';
app.use(morgan(morganOption));
app.use(cors({origin: CLIENT_ORIGIN}));
app.use(helmet());

app.use('/api/login', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/journal-entries', journalEntriesRouter);
app.use('/api/share', shareRouter);
app.use('/api/metrics', metricsRouter);

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'Server error' } };
    } else {
        response = { error: error.message };
    };
    res.status(500).json(response);
});

app.get('/api/status', (req, res) => {
    res.json({ok: true});
});

app.get('/api/auth-test', requireAuth, (req, res, next) => {
    res.status(200).json({message: `It works!`});
});

module.exports = app;
