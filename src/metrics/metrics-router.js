const express = require('express');
const MetricsService = require('./metrics-service');

const requrieAuth = require('../middleware/jwt-auth');
const metricsRouter = express.Router();

metricsRouter
    .get('/', requrieAuth, (req, res, next) => {
        const db = req.app.get('db');
        const userId = req.userRecord.id;

        let totalEntryCount = MetricsService.totalEntriesForUser(db, userId);
        let totalPrivateEntries = MetricsService.totalPrivateEntriesForUser(db, userId);
        let totalPublicEntries = MetricsService.totalPublicEntriesForUser(db, userId);
        let totalEntriesByFeeling = MetricsService.totalEntriesByFeelingForUser(db, userId);
        let totalEntriesByDay = MetricsService.totalEntriesByDayForUser(db, userId);
        let totalEntrisByMonth = MetricsService.totalEntriesByMonthForUser(db, userId);

        Promise.all([
            totalEntryCount,
            totalPrivateEntries,
            totalPublicEntries,
            totalEntriesByFeeling,
            totalEntriesByDay,
            totalEntrisByMonth
        ])
            .then(results => {
                // For entries by feeling, entries by day, and entries by month,
                // process the data from Postgres into an object and insert each
                // back into the results array for later serialization
                results[3] = MetricsService.buildFeelingsObjectFromArray(results[3]);

                results[4] = MetricsService.buildDaysObjectFromArray(results[4]);

                results[5] = MetricsService.buildMonthsObjectFromArray(results[5]);

                let combinedMetrics = MetricsService.serializeMetricsObject(results)

                return res.json(combinedMetrics);
            })
            .catch(error => {
                next(error)
            });
    });

module.exports = metricsRouter;
