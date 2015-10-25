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
        if (typeof req.session.user_id == 'undefined')
            return res.redirect('/login');

        var userRepo = locator.get('user-repository');
        userRepo.find(req.session.user_id)
            .then(function (users) {
                var user = users.length && users[0];
                if (!user) {
                    req.session.destroy(function (err) {
                        if (err) {
                            logger.error('session.destroy()', err);
                            return app.abort(res, 500, 'session.destroy()');
                        }
                        res.redirect('/login');
                    });
                    return;
                }

                res.render('index');
            })
            .catch(function (err) {
                logger.error('GET / failed', err);
                app.abort(res, 500, 'GET / failed');
            });
    });

    app.use('/', router);
};
