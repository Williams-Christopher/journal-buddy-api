const express = require('express');
const JournalEntriesService = require('./journal-entries-service');

const requireAuth = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();
const journalEntriesRouter = express.Router();
const path = require('path');

journalEntriesRouter
    .post('/', requireAuth, jsonBodyParser, (req, res, next) => {
        const db = req.app.get('db');

        const {feeling, body, privacy} = req.body;
        const tempEntry = {
            feeling,
            body,
            privacy
        };

        for(const [key, value] of Object.entries(tempEntry)) {
            if(!value) {
                return res.status(400).json({error: `Missing ${key} in request body`})
            }
        }

        tempEntry.title = req.body.title || `Untitled entry`;
        tempEntry.user_id = req.userRecord.id;

        const sanitizedEntry = JournalEntriesService.serializeEntry(tempEntry);

        JournalEntriesService.insertEntry(db, sanitizedEntry)
            .then(id => {
                console.log(id);
                if(!id) {
                    return res
                        .status(400)
                        .json({error: 'There was an error inserting the new entry'});
                }
                return res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${id}`))
                    .end();
            })
            .catch(next);
    });

module.exports = journalEntriesRouter;
