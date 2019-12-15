const express = require('express');
const ShareService = require('./share-service');

const shareRouter = express.Router();

shareRouter
    .get('/:entry_id', (req, res, next) => {
        const db = req.app.get('db');
        const requestedEntryId = req.params.entry_id;

        ShareService.getEntryForPermalink(db, requestedEntryId)
            .then(entry => {
                return res
                    .status(200)
                    .json({
                        user: entry[0].first_name,
                        title: entry[0].title,
                        body: entry[0].body,
                        created: entry[0].created
                    })
            })
            .catch(error => {
                return res.status(404).json({ error: 'Entry does not exist or is private' });
            });
    });

module.exports = shareRouter;
