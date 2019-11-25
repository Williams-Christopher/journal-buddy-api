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

            it(`responds 400 'Missing user_id in request body`, () => {
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

        context(`given a request body with a valid entry and JWT`, () => {
            const goodEntry = Object.assign({}, testEntry);
            delete goodEntry.created;

            return supertest(app)
                .post('/api/journal-entries')
                .send(goodEntry)
                .set('Authorization', `${testHelpers.createBearerToken(testUser)}`)
                .expect(201)
                // .expect(res.headers.location).to.eql(`/api/journal-entries/${}`)
                // .expect(res => {

                // })
        });
    });

    describe.skip(`PATCH /api/journal-entries`, () => {

    });

    describe.skip(`GET /api/journal-entries`, () => {

    });
});
