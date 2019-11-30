module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || ['https://mms-photo-board.cwilliams.now.sh', 'http://localhost:3000', /(192\.168\.1\.)(([0-2][0-9]){0}([0-9])){1,3}/],
    DB_URL: process.env.DATABASE_URL || 'postgresql://journalbuddy@localhost/journal-buddy-dev',
    DB_URL_TEST: process.env.DB_URL_TEST || 'postgresql://journalbuddy@localhost/journal-buddy-test',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY
};
