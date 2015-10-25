/**
 * Index route
 */

'use strict'

var locator = require('node-service-locator');
var express = require('express');

module.exports = function () {
    var router = express.Router();
    var app = locator.get('app');
    var logger = locator.get('logger');

    router.get('/', function (req, res) {
        if (typeof req.session.user_id != 'undefined')
            return res.redirect('/');

        res.render('login');
    });

    router.post('/', function (req, res) {
        var email = req.body.username;
        var password = req.body.password;

        var userRepo = locator.get('user-repository');
        userRepo.findByEmail(email)
            .then(function (users) {
                var user = users.length && users[0];
                if (!user || !user.checkPassword(password)) {
                    res.message(res.locals.glMessage('INVALID_CREDENTIALS'));
                    return res.redirect('/login');
                }

                req.session.user_id = user.getId();
                req.session.save(function () {
                    res.redirect('/');
                });
            })
            .catch(function (err) {
                logger.error('POST /login failed', err);
                app.abort(500, 'POST /login failed');
            });
    });

    app.use('/login', router);
};
