const knex = require('knex');
const app = require('../src/app');

const testHelpers = require('./test-helpers');
const { DB_URL } = require('../src/config');

describe(`Auth Routes`, () => {
    before(`create db connection`, () => {
        db = knex({
            client: 'pg',
            connection: DB_URL
        });
        app.set('db', db);
    });

    after(`destroy db connection`, () => db.destroy());
    before(`cleanup tables`, () => testHelpers.truncateTables(db));

    describe(`POST /api/login`, () => {
        context(`given a body with missing values`, () => {
            it(`responds with 'Missing user_name in request body' when user_name is missing`, () => {
                const missingUserName = {pasword:'InvalidPasword'};
                return supertest(app)
                    .post('/api/login')
                    .send(missingUserName)
                    .expect(400, { error: `Missing user_name in request body` });
            });

            it(`responds with 'Missing password in request body' when password is missing`, () => {
                const missingPassword = {user_name:'InavlidUser'};
                return supertest(app)
                    .post('/api/login')
                    .send(missingPassword)
                    .expect(400, { error: `Missing password in request body` });
            });
        });

        context(`given a body with invalid credentials`, () => {
            beforeEach(`seed table`, () => testHelpers.seedUsersTable(db));
            afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

            it(`responds 'Invalid user name or password' when given an invalid user`, () => {
                const testUser = testHelpers.createUsersArray()[0];

                testUser.user_name = 'InvalidUser';

                return supertest(app)
                    .post('/api/login')
                    .send(testUser)
                    .expect(400, { error: `Invalid user name or password` });
            });

            it(`responds 'Invalid user name or password' when given an invalid password`, () => {
                const testUser = testHelpers.createUsersArray()[0];
                testUser.password = 'InvalidPassword';

                return supertest(app)
                    .post('/api/login')
                    .send(testUser)
                    .expect(400, { error: `Invalid user name or password` });
            });
        });

        context(`given a body with a valid user credentials`, () => {
            beforeEach(`seed table`, () => testHelpers.seedUsersTable(db));
            afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

            it(`responds with a JSON body including a JWT`, () => {
                const testUser = testHelpers.createUsersArray()[0];
                testUser.password = 'password01';

                return supertest(app)
                    .post('/api/login')
                    .send(testUser)
                    .expect(200, /authToken/)
            });
        });
    });
});
