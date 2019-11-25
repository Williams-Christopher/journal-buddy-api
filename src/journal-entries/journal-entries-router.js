const express = require('express');
const JournalEntriesService = require('./journal-entries-service');

const requireAuth = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();
const journalEntriesRouter = express.Router();
const path = require('path');

journalEntriesRouter
    .post('/', requireAuth, jsonBodyParser, (req, res, next) => {
        const db = req.app.get('db');

        const {user_id, feeling, body, privacy} = req.body;
        const newEntry = {
            user_id,
            feeling,
            body,
            privacy
        };

        for(const [key, value] of Object.entries(newEntry)) {
            if(!value) {
                return res.status(400).json({error: `Missing ${key} in request body`})
            }
        }

        res.send(newEntry);
    });

module.exports = journalEntriesRouter;
