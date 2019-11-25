const xss = require('xss');
const bcrypt = require('bcryptjs');
const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])(?=.{8,})[\S]+/;

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
