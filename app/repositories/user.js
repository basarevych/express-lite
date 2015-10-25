/**
 * User repository
 */

'use strict'

var locator = require('node-service-locator');
var q = require('q');
var BaseRepository = require('./base');
var UserModel = require('../models/user');

function UserRepository() {
    BaseRepository.call(this);
}

UserRepository.prototype = new BaseRepository();
UserRepository.prototype.constructor = UserRepository;

UserRepository.prototype.find = function (id) {
    var logger = locator.get('logger');
    var defer = q.defer();

    id = parseInt(id, 10);
    if (isNaN(id)) {
        defer.reject('UserRepository.find() - invalid parameters');
        return defer.promise;
    }

    var db = this.getSqlite();
    var sel = db.prepare(
        "SELECT * "
      + "  FROM users "
      + " WHERE id = $id "
    );
    sel.all(
        { $id: id },
        function (err, result) {
            if (err) {
                defer.reject();
                logger.error('UserRepository.find() - sqlite run', err);
                process.exit(1);
            }

            sel.finalize();
            db.close();

            var users = [];
            result.forEach(function (row) {
                var user = new UserModel(row);
                users.push(user);
            });

            defer.resolve(users);
        }
    );

    return defer.promise;
};

UserRepository.prototype.findByEmail = function (email) {
    var logger = locator.get('logger');
    var defer = q.defer();

    var db = this.getSqlite();
    var sel = db.prepare(
        "SELECT * "
      + "  FROM users "
      + " WHERE email = $email "
    );
    sel.all(
        { $email: email },
        function (err, result) {
            if (err) {
                defer.reject();
                logger.error('UserRepository.findByEmail() - sqlite run', err);
                process.exit(1);
            }

            sel.finalize();
            db.close();

            var users = [];
            result.forEach(function (row) {
                var user = new UserModel(row);
                users.push(user);
            });

            defer.resolve(users);
        }
    );

    return defer.promise;
};

module.exports = UserRepository;
