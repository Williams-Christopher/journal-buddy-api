const xss = require('xss');

JournalEntriesService = {
    serializeEntry(newEntry) {
        return {
            user_id: newEntry.user_id,
            feeling: newEntry.feeling,
            title: xss(newEntry.title),
            body: xss(newEntry.body),
            privacy: newEntry.privacy,
        };
    },

    insertEntry(db, newEntry) {
        return db
            .into('entries')
            .insert(newEntry)
            .returning('entry_id');
    },

    getEntriesForUser(db, userId) {
        return db('entries')
            .select('*')
            .where({
                user_id: userId
            });
    },

    getEntryForUser(db, entryId, userId) {
        return db('entries')
            .select('*') // What value does bringing in the id and user_id provide?
            .where({
                user_id: userId,
                entry_id: entryId,
            });
    },

    getEntryForPermalink(db, entryId) {
        return db
            .from('entries')
            .select([
                'users.user_name',
                'entries.title',
                'entries.body',
                'entries.created'
            ])
            .innerJoin(
                'users',
                'entries.user_id',
                'users.id'
            )
            .where({
                entry_id: entryId,
                privacy: 1
            });
    }
};

module.exports = JournalEntriesService;
