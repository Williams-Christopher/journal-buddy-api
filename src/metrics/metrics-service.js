MetricsService = {
    totalEntriesForUser(db, user_id) {
        return db
            .from('entries')
            .count({'total_entries': '*'})
            .where({
                user_id
            })
            .first();
    },

    totalPrivateEntriesForUser(db, user_id) {
        return db
            .from('entries')
            .count({total_private_entries: '*'})
            .where({
                user_id,
                privacy: 0
            })
            .first();
    },

    totalPublicEntriesForUser(db, user_id) {
        return db
            .from('entries')
            .count({total_public_entries: '*'})
            .where({
                user_id,
                privacy: 1
            })
            .first();
    },

    totalEntriesByFeelingForUser(db, user_id) {
        return db
            .from('entries')
            .select('feeling')
            .count({total: '*'})
            .where({
                user_id,
            })
            .groupBy('feeling');
    },

    totalEntriesByDayForUser(db, user_id) {
        return db
            .raw(`
                select to_char(created, 'Day') as day_name,
                count(to_char(created, 'Day')) as total
                from entries
                where user_id = ?
                group by day_name
                order by day_name
                `, [user_id])
            .then(result => result.rows);
    },

    totalEntriesByMonthForUser(db, user_id) {
        return db
            .raw(`
                select to_char(created, 'Month') as month_name,
                count(to_char(created, 'Month')) as total
                from entries
                where user_id = ?
                group by month_name
                order by month_name
                `, [user_id])
            .then(result => result.rows);
    },

    buildFeelingsObjectFromArray(feelingsArray) {
        const feelingsObject = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        feelingsArray.forEach(obj =>
            feelingsObject[obj.feeling] = parseInt(obj.total)
        );

        return feelingsObject;
    },

    buildDaysObjectFromArray(daysArray) {
        const daysObject = {
            'Sunday': 0,
            'Monday': 0,
            'Tuesday': 0,
            'Wednesday': 0,
            'Thursday': 0,
            'Friday': 0,
            'Saturday': 0,
        };
        
        daysArray.forEach(obj =>
            daysObject[obj.day_name.trim()] = parseInt(obj.total)
        );

        return daysObject;
    },

    buildMonthsObjectFromArray(monthsArray) {
        const monthsObject = {
            'January': 0,
            'February': 0,
            'March': 0,
            'April': 0,
            'May': 0,
            'June': 0,
            'July': 0,
            'August': 0,
            'September': 0,
            'October': 0,
            'November': 0,
            'December': 0,
        };

        monthsArray.forEach(obj =>
            monthsObject[obj.month_name.trim()] = parseInt(obj.total)
        );

        return monthsObject;
    },

    serializeMetricsObject(resultsArray) {
        return {
            total_entries: parseInt(resultsArray[0].total_entries),
            private_entries: parseInt(resultsArray[1].total_private_entries),
            public_entries: parseInt(resultsArray[2].total_public_entries),
            total_by_feeling: resultsArray[3],
            total_by_day: resultsArray[4],
            total_by_month: resultsArray[5],
        }
    },
};

module.exports = MetricsService;
