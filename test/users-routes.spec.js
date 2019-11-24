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

    after(`destroy db connection`, () => db.destroy());
    before(`cleanup tables`, () => testHelpers.truncateTables(db));

    describe(`POST /api/users`, () => {
        context(`given a body with missing fields or values`, () => {
            // For this context block, copy this test user and remove the appropriate
            // key from the copy for testing missing fields
            const contextTestUser = {
                user_name: 'testuser',
                first_name: 'Tester',
                email: 'test@test.com',
                password: 'Testpassword!23'
            };

            it(`responds 400 'Missing user_name in request body' when user_name field not provided`, () => {
                const testUser = Object.assign({}, contextTestUser);
                delete testUser.user_name;

                return supertest(app)
                    .post('/api/users')
                    .send(testUser)
                    .expect(400, {error: 'Missing user_name in request body'});
            });


            it(`responds 400 'Missing first_name in request body' when user_name field not provided`, () => {
                const testUser = Object.assign({}, contextTestUser);
                delete testUser.first_name;

                return supertest(app)
                    .post('/api/users')
                    .send(testUser)
                    .expect(400, {error: 'Missing first_name in request body'});
            });


            it(`responds 400 'Missing email in request body' when user_name field not provided`, () => {
                const testUser = Object.assign({}, contextTestUser);
                delete testUser.email;

                return supertest(app)
                    .post('/api/users')
                    .send(testUser)
                    .expect(400, {error: 'Missing email in request body'});
            });


            it(`responds 400 'Missing password in request body' when user_name field not provided`, () => {
                const testUser = Object.assign({}, contextTestUser);
                delete testUser.password;

                return supertest(app)
                    .post('/api/users')
                    .send(testUser)
                    .expect(400, {error: 'Missing password in request body'});
            });
        });

        context(`given a valid request body`, () => {
            context(`with an existing user name`, () => {
                beforeEach(`seed users table`, () => testHelpers.seedUsersTable(db));
                afterEach(`truncate tables`, () => testHelpers.truncateTables(db));
    
                it(`responds with HTTP status 400 and 'Requested user name is in use'`, () => {
                    const testUser = testHelpers.createUsersArray()[0];
                    testUser.password = 'Password!1';
    
                    return supertest(app)
                        .post('/api/users')
                        .send(testUser)
                        .expect(400, {error: 'Requested user name is in use'})
                });
            });

            context(`with a password that doesn't meet complexity requirements`, () => {
                const testUser = testHelpers.createUsersArray()[0];

                it(`responds with 400 and 'Password is too short' when password length is less than 8 characters`, () => {
                    testUser.password = 'Passw!1'; /* Complex but only 7 characters */
                    return supertest(app)
                        .post('/api/users')
                        .send(testUser)
                        .expect(400, {error: 'Password is too short'});
                });

                it(`responds 400 and 'Password is too long' when password length is greater 20 characters`, () => {
                    testUser.password = 'Password!1Password!1a'; /* Complex but 21 characters */
                    return supertest(app)
                        .post('/api/users')
                        .send(testUser)
                        .expect(400, {error: 'Password is too long'});
                });

                it(`responds 400 and 'Password does not meet complexity requirements' when password is not complex`, () => {
                    testUser.password = 'notcomplex!';
                    return supertest(app)
                        .post('/api/users')
                        .send(testUser)
                        .expect(400, {error: 'Password does not meet complexity requirements'});
                });
            });

            context(`with a valid new user`, () => {
                beforeEach(`seed users table`, () => testHelpers.seedUsersTable(db));
                afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

                it(`responds with 201 as the user is created`, () => {
                    const testUser = {
                        user_name: 'newuser',
                        first_name: 'New',
                        password: 'Password!1',
                        email: 'newuser@newuser.com'
                    };

                    return supertest(app)
                        .post('/api/users')
                        .send(testUser)
                        .expect(201);
                });
            });
        });
    });
});
