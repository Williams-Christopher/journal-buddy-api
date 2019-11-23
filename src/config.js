module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DATABASE_URL || 'postgresql://journalbuddy@localhost/journal-buddy-dev',
    DB_TEST_URL: process.env.TEST_DB_URL || 'postgresql://journalbuddy@localhost/journal-buddy-test',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY
};
