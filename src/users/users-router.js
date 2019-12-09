const express = require('express');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const db = req.app.get('db');
        
        const { user_name, first_name, email, password } = req.body;
        const newUser = {
            user_name: user_name,
            first_name: first_name,
            email: email,
            password: password,
        };

        for(const [key, value] of Object.entries(newUser)) {
            if(!value) {
                return res.status(400).json({ error: `Missing ${key} in request body` });
            }
        };

        const passwordValidationMessage = UsersService.passwordMeetsRequirements(newUser.password);
        if(passwordValidationMessage) {
            return res.status(400).json({error: `${passwordValidationMessage}`});
        }

        if(!UsersService.emailValidation(newUser.email)) {
            return res.status(400).json({error: `Email does not appear valid`})
        }

        UsersService.checkUserNameExists(db, newUser.user_name)
            .then(userNameExists => {
                if(userNameExists) {
                    return res.status(400).json({error: 'Requested user name is in use'});
                }

                const sanitizedNewUser = UsersService.serializeNewUser(newUser);
                return UsersService.insertNewUser(db, sanitizedNewUser)
                    .then(newUserId => {
                        if(!newUserId) {
                            res.status(400).json({error: 'User was not created'});
                            throw new Error('Unknown error on new user insert');
                        }

                        return res.status(201).end();
                    });
            })
            .catch(next);


    });

module.exports = usersRouter;
