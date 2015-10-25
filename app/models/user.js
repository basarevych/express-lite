/**
 * User model
 */

'use strict'

var locator = require('node-service-locator');
var bcrypt = require('bcrypt');
var q = require('q');
var moment = require('moment-timezone');
var BaseModel = require('./base');

function UserModel(dbRow) {
    this.id = null;
    this.name = null;
    this.email = null;
    this.password = null;
    this.is_admin = false;
    this.created_at = moment();

    if (dbRow) {
        var utc = moment(dbRow.created_at); // db field is in UTC

        this.id = dbRow.id;
        this.name = dbRow.name;
        this.email = dbRow.email;
        this.password = dbRow.password;
        this.is_admin = dbRow.is_admin;
        this.created_at = moment.tz(utc.format('YYYY-MM-DD HH:mm:ss'), 'UTC').local();
    }
};

UserModel.prototype = new BaseModel();
UserModel.prototype.constructor = UserModel;

UserModel.encryptPassword = function (password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

UserModel.prototype.setId = function (id) {
    this.field('id', id);
    return this;
};

UserModel.prototype.getId = function () {
    return this.field('id');
};

UserModel.prototype.setName = function (name) {
    this.field('name', name);
    return this;
};

UserModel.prototype.getName = function () {
    return this.field('name');
};

UserModel.prototype.setEmail = function (email) {
    this.field('email', email);
    return this;
};

UserModel.prototype.getEmail = function () {
    return this.field('email');
};

UserModel.prototype.setPassword = function (password) {
    this.field('password', password);
    return this;
};

UserModel.prototype.getPassword = function () {
    return this.field('password');
};

UserModel.prototype.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.getPassword());
};

UserModel.prototype.setIsAdmin = function (isAdmin) {
    this.field('is_admin', isAdmin);
    return this;
};

UserModel.prototype.getIsAdmin = function () {
    return this.field('is_admin');
};

UserModel.prototype.setCreatedAt = function (createdAt) {
    this.field('created_at', createdAt);
    return this;
};

UserModel.prototype.getCreatedAt = function () {
    return this.field('created_at');
};

UserModel.prototype.save = function (evenIfNotDirty) {
    var logger = locator.get('logger');
    var repo = locator.get('user-repository');
    var defer = q.defer();

    if (this.getId() && !this._dirty && evenIfNotDirty !== true) {
        defer.resolve(this.getId());
        return defer.promise;
    }

    var me = this;
    var db = repo.getSqlite();

    var query, params;
    if (me.getId()) {
        query = "UPDATE users "
              + "   SET name = $name, "
              + "       email = $email, "
              + "       password = $password, "
              + "       is_admin = $is_admin, "
              + "       created_at = $created_at "
              + " WHERE id = $id ";
        params = {
            $name: me.getName(),
            $email: me.getEmail(),
            $password: me.getPassword(),
            $is_admin: me.getIsAdmin(),
            $created_at: me.getCreatedAt().tz('UTC').format('YYYY-MM-DD HH:mm:ss'), // save in UTC
            $id: me.getId(),
        };
    } else {
        query = "   INSERT "
              + "     INTO users(name, email, password, is_admin, created_at) "
              + "   VALUES ($name, $email, $password, $is_admin, $created_at) ";
        params = {
            $name: me.getName(),
            $email: me.getEmail(),
            $password: me.getPassword(),
            $is_admin: me.getIsAdmin(),
            $created_at: me.getCreatedAt().tz('UTC').format('YYYY-MM-DD HH:mm:ss'), // save in UTC
        };
    }

    var sel = db.prepare(query);
    sel.run(
        params,
        function (err) {
            if (err) {
                defer.reject();
                logger.error('UserModel.save() - sqlite3 run', err);
                process.exit(1);
            }

            if (!me.getId())
                me.setId(this.lastID);

            sel.finalize();
            db.close();
            me.dirty(false);

            defer.resolve(me.getId());
        }
    );

    return defer.promise;
};

UserModel.prototype.delete = function () {
    var logger = locator.get('logger');
    var repo = locator.get('user-repository');
    var defer = q.defer();

    if (!this.getId()) {
        defer.resolve(0);
        return defer.promise;
    }

    var me = this;
    var db = repo.getSqlite();

    var del = db.prepare(
        "DELETE "
      + "  FROM users "
      + " WHERE id = $id "
    );
    del.run(
        { $id: me.getId() },
        function (err) {
            if (err) {
                defer.reject();
                logger.error('UserModel.delete() - sqlite3 run', err);
                process.exit(1);
            }

            db.end();
            me.setId(null);
            me.dirty(false);

            defer.resolve(this.changes);
        }
    );

    return defer.promise;
};

module.exports = UserModel;
