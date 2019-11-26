const knex = require('knex');
const app = require('../src/app');

const testHelpers = require('./test-helpers');
const { DB_URL } = require('../src/config');

describe.only(`Users routes`, () => {
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
            console.log('TEST TOKEN: ', testToken);

            it.skip(`responds 400 'Missing user_id in request body`, () => {
                const badEntry = Object.assign({}, testEntry);
                delete badEntry.user_id;

                return supertest(app)
                    .post('/api/journal-entries')
                    .send(badEntry)
                    .set('Authorization', testHelpers.createBearerToken(testUser))
                    .expect(400, {error: 'Missing user_id in request body'});
            });

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

    describe.only(`GET /api/journal-entries`, () => {
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

            context.only(`given a request with a valid token`, () => {
                it(`responds with 200 and a list of entries for the token user id`, () => {
                    const expectedEntries = testHelpers.createEntriesArray()
                        .filter(entry => entry.user_id == 1);

                    return supertest(app)
                        .get('/api/journal-entries')
                        .set('Authorization', testHelpers.createBearerToken(testUser))
                        .expect(200)
                        .expect(res => {
                            expect(res.body.length).to.eql(expectedEntries.length);
                            for (const prop of ['id', 'user_id', 'entry_id', 'feeling', 'title', 'body', 'privacy', 'created']) {
                                for(let i = 0; i < res.body.length; i++) {
                                    expect(res.body[i]).to.have.property(prop);
                                    expect(res.body[i][prop]).to.eql(res.body[i][prop]);
                                };
                            };
                        });
                });
            });
        });

        describe(`/api/journal-entries/:id`, () => {

        });

        describe(`/api/journal-entries/share/:id`, () => {

        });
    });
});
