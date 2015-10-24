/**
 * Index route
 */

'use strict'

var locator = require('node-service-locator');
var express = require('express');

module.exports = function () {
    var router = express.Router();
    var app = locator.get('app');

    router.get('/', function (req, res) {
        if (typeof req.session.user_id == 'undefined')
            return res.redirect('/login');

        res.render('index');
    });

    app.use('/', router);
};
