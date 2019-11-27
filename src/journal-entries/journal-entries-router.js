const express = require('express');
const JournalEntriesService = require('./journal-entries-service');

const requireAuth = require('../middleware/jwt-auth');
const jsonBodyParser = express.json();
const journalEntriesRouter = express.Router();
const path = require('path');

journalEntriesRouter
    .all('/*', requireAuth)
    .post('/', jsonBodyParser, (req, res, next) => {
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
            .then(rawEntryId => {
                if(!rawEntryId) {
                    return res
                        .status(400)
                        .json({error: 'There was an error inserting the new entry'});
                }
                return res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${rawEntryId[0]}`))
                    .end();
            })
            .catch(next);
    })
    .get('/', (req, res, next) => {
        // Why is this route causing a warning about a promise being created
        // but not returned from in jwt-auth at 23:17????
        const db = req.app.get('db');
        const userId = req.userRecord.id;

        JournalEntriesService.getEntriesForUser(db, userId)
            .then(entries => {
                return res.status(200).json(entries);
            })
            .catch(next);
    })
    .get('/:entry_id', (req, res, next) => {
        const db = req.app.get('db');
        const requestedEntry = req.params.entry_id;
        const forUserId = req.userRecord.id;

        JournalEntriesService.getEntryForUser(db, requestedEntry, forUserId)
            .then(entry => {
                if(entry.length === 0) {
                    return res.status(400).json({error: 'Entry does not exist for user'});
                }

                return res.status(200).json(entry[0]);
            })
            .catch(next);
    });

module.exports = journalEntriesRouter;
