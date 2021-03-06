const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const AuthService = {
    comparePasswords(password, hash) {
        return bcrypt.compareSync(password, hash);
    },

    createJwt(subject, payload) {
        return jwt.sign(
            payload,
            config.JWT_SECRET,
            {
                subject,
                algorithm: 'HS256',
            }
        );
    },

    verifyJwt(token) {
        return jwt.verify(
            token,
            config.JWT_SECRET,
            {
                algorithms: ['HS256'],
            }
        );
    },

    getUserWithUserName(db, user_name) {
        return db('users')
            .where({ user_name })
            .first();
    },
};

module.exports = AuthService;
