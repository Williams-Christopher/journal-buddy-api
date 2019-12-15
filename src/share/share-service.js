ShareService = {
    getEntryForPermalink(db, entryId) {
        return db
            .from('entries')
            .select([
                'users.first_name',
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
            })
    },
};

module.exports = ShareService;
