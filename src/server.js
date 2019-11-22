require('dotenv').config();
const app = require('./app');
const knex = require('knex');
// Check out process.env.NODE_ENV to determine if DB_URL or DB_TEST_URL?
const { PORT, DB_TEST_URL } = require('./config');

const db = knex({
    client: 'pg',
    connection: DB_TEST_URL
});
app.set('db', db);

app.listen(PORT, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Server available at http://localhost:${PORT}`);
    }
});
