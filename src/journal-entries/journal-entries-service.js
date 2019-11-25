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
};

module.exports = JournalEntriesService;
