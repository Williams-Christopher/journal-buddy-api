const xss = require('xss');
const bcrypt = require('bcryptjs');
const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])(?=.{8,})[\S]+/;
/* email regex from emailregex.com, the RFC 5322 Official Standard version */
const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const UsersService = {
    checkUserNameExists(db, user_name) {
        return db('users')
            .first('user_name')
            .where({user_name})
            .then(foundUserName => {
                if(foundUserName) {
                    return true;
                }
                return false;
            })
            .catch(error => error);
    },

    insertNewUser(db, newUser) {
        return(db)('users')
            .insert(newUser)
            .returning('id');
    },

    passwordMeetsRequirements(password) {
        if(password.length <= 7) {
            return 'Password is too short';
        }

        if(password.length > 20) {
            return 'Password is too long';
        }

        if(!PASSWORD_REGEX.test(password)) {
            return 'Password does not meet complexity requirements'
        }
    },

    emailValidation(email) {
        if(EMAIL_REGEX.test(email)) {
            return true;
        };

        return false;
    },

    serializeNewUser(newUser) {
        return {
            user_name: xss(newUser.user_name),
            first_name: xss(newUser.first_name),
            email: xss(newUser.email),
            password: bcrypt.hashSync(newUser.password, 12),
        };
    },
};

module.exports = UsersService;
