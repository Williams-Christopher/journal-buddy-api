const knex = require('knex');
const app = require('../src/app');

const testHelpers = require('./test-helpers');
const { DB_URL } = require('../src/config');

describe(`Metrics routes`, () => {
    before(`create db connection`, () => {
        db = knex({
            client: 'pg',
            connection: DB_URL
        });
        app.set('db', db);
    });

    before(`cleanup tables`, () => testHelpers.truncateTables(db));
    after(`destroy db connection`, () => db.destroy());

    describe(`GET /api/metrics`, () => {
        beforeEach(`insert test data`, () => testHelpers.seedAllTables(db));
        afterEach(`truncate tables`, () => testHelpers.truncateTables(db));

        const userWithEntries = testHelpers.createUsersArray()[0];
        const userWithNoEntries = testHelpers.createUsersArray()[3];

        context(`given an invalid auth token`, () => {
            it(`returns 401 'Unauthorized request`, () => {
                const invalidAuthToken = testHelpers.createBearerToken(userWithEntries, 'incorrect-secret');

                return supertest(app)
                    .get('/api/metrics')
                    .set('Authorization', invalidAuthToken)
                    .expect(401, {error: 'Unauthorized request'});
            });
        });

        context(`given a valid auth token`, () => {
            const expectedAllRootKeys = [];
            const expectedRootValueKeys = ['total_entries', 'private_entries', 'public_entries'];
            const expectedRootObjectKeys = ['total_by_feeling', 'total_by_day', 'total_by_month'];
            const feelingKeys = [1, 2, 3, 4, 5];
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            it(`returns a JSON response body containing a metrics object with all values set to zero`, () => {
                const authToken = testHelpers.createBearerToken(userWithNoEntries);

                return supertest(app)
                    .get('/api/metrics')
                    .set('Authorization', authToken)
                    .expect(res => {
                        const body = res.body;
                        for(const key of expectedAllRootKeys.concat(expectedRootValueKeys, expectedRootObjectKeys)) {
                            expect(body).to.have.property(key);
                        }

                        for(const key of expectedRootValueKeys) {
                            expect(body[key]).to.equal(0);
                        }

                        for(const key of feelingKeys) {
                            expect(body.total_by_feeling.hasOwnProperty(key));
                            expect(body.total_by_feeling[key]).to.equal(0);
                        }

                        for(const key of days) {
                            expect(body.total_by_day.hasOwnProperty(key));
                            expect(body.total_by_day[key]).to.equal(0);
                        }

                        for(const key of months) {
                            expect(body.total_by_month.hasOwnProperty(key));
                            expect(body.total_by_month[key]).to.equal(0);
                        }
                    });
            });

            it(`returns a JSON response body containing a metrics object with actual values for the given user`, () => {
                const authToken = testHelpers.createBearerToken(userWithEntries);

                return supertest(app)
                    .get('/api/metrics')
                    .set('Authorization', authToken)
                    .expect(res => {
                        const body = res.body;
                        for(const key of expectedAllRootKeys.concat(expectedRootValueKeys, expectedRootObjectKeys)) {
                            expect(body).to.have.property(key);
                        }
                    });
            });
        });
    });
});