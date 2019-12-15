const app = require('../src/app');
const knex = require('knex');

const testHelpers = require('./test-helpers');
const { DB_URL } = require('../src/config');

describe(`Users routes`, () => {
    before(`create db connection`, () => {
        db = knex({
            client: 'pg',
            connection: DB_URL
        });
        app.set('db', db);
    });

    before(`cleanup tables`, () => testHelpers.truncateTables(db));
    after(`destroy db connection`, () => db.destroy());

    describe(`/api/share/:entry_id`, () => {
        beforeEach(`seed tables`, () => testHelpers.seedAllTables(db));
        afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

        const validPublicEntryId = testHelpers.createEntriesArray()[2];
        const validPrivateEntryId = testHelpers.createEntriesArray()[0];
        const invalidEntryId = '11111111-2222-3333-4444-555555555555'

        it(`responds 404 'Entry does not exist or is private' when an invalid entry_id is given`, () => {
            return supertest(app)
                .get(`/api/share/${invalidEntryId}`)
                .expect(404, { error: 'Entry does not exist or is private' });
        });

        it(`responds 404 'Entry does not exist or is private' when a valid entry_id is given but the entry is private`, () => {
            return supertest(app)
                .get(`/api/share/${validPrivateEntryId.entry_id}`)
                .expect(404, { error: 'Entry does not exist or is private' });
        });

        it(`responds 200 with the requested entry in a JSON formatted body when a public and valid entry_id is requested`, () => {
            return supertest(app)
                .get(`/api/share/${validPublicEntryId.entry_id}`)
                .expect(200)
                .expect(res => {
                    // const resultProperties = ['user', 'title', 'body', 'created'];
                    const resultProperties = ['user', 'title', 'body'];
                    const expectedUserName = testHelpers.createUsersArray().filter(user =>
                        user.id === validPublicEntryId.user_id
                    );
                    const expectedValues = [
                        expectedUserName[0].first_name,
                        validPublicEntryId.title,
                        validPublicEntryId.body,
                        // validPublicEntryId.created
                    ];

                    resultProperties.forEach((prop, index) => {
                        expect(res.body).to.have.property(prop);
                        expect(res.body[prop]).to.equal(expectedValues[index]);
                    });
                });
        });
    });
});