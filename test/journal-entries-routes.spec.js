const knex = require('knex');
const app = require('../src/app');

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

    describe(`POST /api/journal-entries`, () => {
        // Use Object.assign() to copy these test objects if a modified
        // test user or entry are required
        const testUser = testHelpers.createUsersArray()[0];
        const testEntry = testHelpers.createEntriesArray()[0];
        
        context(`given a request body with an invalid bearer token`, () => {
            it(`responds with HTTP 401 'Unauthorized request'`, () => {
                return supertest(app)
                    .post('/api/journal-entries')
                    .send(testEntry)
                    .set('Authorization', `${testHelpers.createBearerToken(testUser, 'invalid-jwt-secret')}`)
                    .expect(401, {error: 'Unauthorized request'});
            });
        });

        context(`given a request body missing fields with a valid bearer token`, () => {
            beforeEach(`seed users table`, () => testHelpers.seedUsersTable(db));
            afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

            const testToken = testHelpers.createBearerToken(testUser);

            it(`responds 400 'Missing feeling in request body`, () => {
                const badEntry = Object.assign({}, testEntry);
                delete badEntry.feeling;
                
                return supertest(app)
                    .post('/api/journal-entries')
                    .send(badEntry)
                    .set('Authorization', testToken)
                    .expect(400, {error: 'Missing feeling in request body'});
            });

            it(`responds 400 'Missing body in request body`, () => {
                const badEntry = Object.assign({}, testEntry);
                delete badEntry.body;
                
                return supertest(app)
                    .post('/api/journal-entries')
                    .send(badEntry)
                    .set('Authorization', testToken)
                    .expect(400, {error: 'Missing body in request body'});
            });

            it(`responds 400 'Missing privacy in request body`, () => {
                const badEntry = Object.assign({}, testEntry);
                delete badEntry.privacy;
                
                return supertest(app)
                    .post('/api/journal-entries')
                    .send(badEntry)
                    .set('Authorization', testToken)
                    .expect(400, {error: 'Missing privacy in request body'});
            });
        });

        context(`given a request body with a valid entry and token`, () => {
            beforeEach(`seed users table`, () => testHelpers.seedUsersTable(db));
            afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

            const goodEntry = Object.assign({}, testEntry);
            delete goodEntry.id;
            delete goodEntry.created;
            goodEntry.privacy = 1;

            it(`responds 201 with a link to the new entry in the location header`, () => {
                return supertest(app)
                    .post('/api/journal-entries')
                    .send(goodEntry)
                    .set('Authorization', `${testHelpers.createBearerToken(testUser)}`)
                    .expect(201)
                    .expect(res => {
                        expect(res.headers).to.have.property('location');
                    });
            });
        });
    });

    describe.skip(`PATCH /api/journal-entries`, () => {

    });

    describe(`GET /api/journal-entries`, () => {
        beforeEach(`seed tables`, () => testHelpers.seedAllTables(db));
        afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

        describe(`/api/journal-entries`, () => {
            const testUser = testHelpers.createUsersArray()[0];

            context(`given a request with an invalid token`, () => {

                it(`responds with 401 and 'Unauthorized request'`, () => {
                    return supertest(app)
                        .get('/api/journal-entries')
                        .set('Authorization', testHelpers.createBearerToken(testUser, 'invalid-secret'))
                        .expect(401, {error: 'Unauthorized request'});
                });
            });

            context(`given a request with a valid token`, () => {
                it(`responds with 200 and a list of entries for the token user id`, () => {
                    const expectedEntries = testHelpers.createEntriesArray()
                        .filter(entry => entry.user_id == 1);

                    return supertest(app)
                        .get('/api/journal-entries')
                        .set('Authorization', testHelpers.createBearerToken(testUser))
                        .expect(200)
                        .expect(res => {
                            expect(res.body.length).to.eql(expectedEntries.length);
                            for (const prop of ['id', 'user_id', 'entry_id', 'feeling', 'title', 'body', 'privacy']) {
                                for(let i = 0; i < res.body.length; i++) {
                                    expect(res.body[i]).to.have.property(prop);
                                    expect(res.body[i][prop]).to.equal(expectedEntries[i][prop]);
                                };
                            };
                        });
                });
            });
        });

        describe(`/api/journal-entries/:entry_id`, () => {
            const testUserWithEntries = testHelpers.createUsersArray()[0];
            const testUserWithNoEntries = testHelpers.createUsersArray()[3];
            const testEntry = testHelpers.createEntriesArray()[0];

            context(`given an invalid auth token`, () => {
                it(`responds 401 'Unauthorized request`, () => {
                    const authToken = testHelpers.createBearerToken(testUserWithEntries, 'invalid-secret');
                    const { entry_id } = testEntry;

                    return supertest(app)
                        .get(`/api/journal-entries/${entry_id}`)
                        .set('Authorization', authToken)
                        .expect(401, {error: 'Unauthorized request'});
                });
            });

            context(`given a valid auth token`, () => {
                it(`responds 400 'Entry does not exist for user' when given an invalid user id and valid entry id`, () => {
                    const user = Object.assign({}, testUserWithNoEntries);
                    const authToken = testHelpers.createBearerToken(user);
                    const { entry_id } = testEntry;

                    return supertest(app)
                        .get(`/api/journal-entries/${entry_id}`)
                        .set('Authorization', authToken)
                        .expect(400, {error: 'Entry does not exist for user'});
                });

                it(`responds 400 'Entry does not exist for user' when given a valid user id and invalid entry_id`, () => {
                    const invalidEntryId = '00000000-1111-2222-3333-444444444444';
                    const authToken = testHelpers.createBearerToken(testUserWithEntries);

                    return supertest(app)
                        .get(`/api/journal-entries/${invalidEntryId}`)
                        .set('Authorization', authToken)
                        .expect(400, {error: 'Entry does not exist for user'});
                });

                it(`responds 200 with the request entry when given a valid user and entry id combination`, () => {
                    const { entry_id } = testEntry;
                    const authToken = testHelpers.createBearerToken(testUserWithEntries);

                    return supertest(app)
                        .get(`/api/journal-entries/${entry_id}`)
                        .set('Authorization', authToken)
                        .expect(200)
                        .expect(res => {
                            for (const prop of ['id', 'user_id', 'entry_id', 'feeling', 'title', 'body', 'privacy']) {
                                expect(res.body).to.have.property(prop);
                                expect(res.body[prop]).to.equal(testEntry[prop]);
                            };
                        });
                });
            });

        });

        describe(`/api/journal-entries/share/json/:entry_id`, () => {
            const validPublicEntryId = testHelpers.createEntriesArray()[2];
            const validPrivateEntryId = testHelpers.createEntriesArray()[0];
            const invalidEntryId = '11111111-2222-3333-4444-555555555555'

            it(`responds 400 'Entry does not exist or is private' when an invalid entry_id is given`, () => {
                return supertest(app)
                    .get(`/api/journal-entries/share/json/${invalidEntryId}`)
                    .expect(400, {error: 'Entry does not exist or is private'});
            });

            it(`responds 400 'Entry does not exist or is private' when a valid entry_id is given but the entry is private`, () => {
                return supertest(app)
                    .get(`/api/journal-entries/share/json/${validPrivateEntryId.entry_id}`)
                    .expect(400, {error: 'Entry does not exist or is private'});
            });

            it(`responds 200 with the requested entry in a JSON formatted body when a public and valid entry_id is requested`, () => {
                return supertest(app)
                .get(`/api/journal-entries/share/json/${validPublicEntryId.entry_id}`)
                .expect(200)
                .expect(res => {
                    // const resultProperties = ['user', 'title', 'body', 'created'];
                    const resultProperties = ['user', 'title', 'body'];
                    const expectedUserName = testHelpers.createUsersArray().filter(user =>
                        user.id === validPublicEntryId.user_id
                    );
                    const expectedValues = [
                        expectedUserName[0].user_name,
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
});
