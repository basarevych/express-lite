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
        res.render('login');
    });

    app.use('/login', router);
};
