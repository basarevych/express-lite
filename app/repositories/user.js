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

UserRepository.prototype.save = function (user) {
    var logger = locator.get('logger');
    var defer = q.defer();

    var db = this.getSqlite();

    var query, params;
    if (user.getId()) {
        query = "UPDATE users "
              + "   SET name = $name, "
              + "       email = $email, "
              + "       password = $password, "
              + "       is_admin = $is_admin, "
              + "       created_at = $created_at "
              + " WHERE id = $id ";
        params = {
            $name: user.getName(),
            $email: user.getEmail(),
            $password: user.getPassword(),
            $is_admin: user.getIsAdmin(),
            $created_at: user.getCreatedAt().tz('UTC').format('YYYY-MM-DD HH:mm:ss'), // save in UTC
            $id: user.getId(),
        };
    } else {
        query = "   INSERT "
              + "     INTO users(name, email, password, is_admin, created_at) "
              + "   VALUES ($name, $email, $password, $is_admin, $created_at) ";
        params = {
            $name: user.getName(),
            $email: user.getEmail(),
            $password: user.getPassword(),
            $is_admin: user.getIsAdmin(),
            $created_at: user.getCreatedAt().tz('UTC').format('YYYY-MM-DD HH:mm:ss'), // save in UTC
        };
    }

    var sel = db.prepare(query);
    sel.run(
        params,
        function (err) {
            if (err) {
                defer.reject();
                logger.error('UserRepository.save() - sqlite3 run', err);
                process.exit(1);
            }

            if (!user.getId())
                user.setId(this.lastID);

            sel.finalize();
            db.close();
            user.dirty(false);

            defer.resolve(user.getId());
        }
    );

    return defer.promise;
};

UserModel.prototype.delete = function (user) {
    var logger = locator.get('logger');
    var defer = q.defer();

    if (!user.getId()) {
        defer.resolve(0);
        return defer.promise;
    }

    var db = this.getSqlite();

    var del = db.prepare(
        "DELETE "
      + "  FROM users "
      + " WHERE id = $id "
    );
    del.run(
        { $id: user.getId() },
        function (err) {
            if (err) {
                defer.reject();
                logger.error('UserRepository.delete() - sqlite3 run', err);
                process.exit(1);
            }

            del.finalize();
            db.end();
            user.setId(null);

            defer.resolve(this.changes);
        }
    );

    return defer.promise;
};

module.exports = UserRepository;
