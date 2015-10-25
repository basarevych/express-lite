/**
 * Base repository
 */

'use strict'

var locator = require('node-service-locator');
var path = require('path');
var sqlite3 = require('sqlite3');

function BaseRepository() {
}

BaseRepository.prototype.getSqlite = function () {
    var engine = new sqlite3.Database(path.join(__dirname, '..', '..', 'db', 'sqlite3.db'));
    engine.serialize(function () {
        engine.run(
            "CREATE TABLE IF NOT EXISTS users ( "
          + "  id INTEGER PRIMARY KEY ASC NOT NULL, "
          + "  name VARCHAR(255) NULL, "
          + "  email VARCHAR(255) NOT NULL, "
          + "  password VARCHAR(255) NOT NULL, "
          + "  is_admin BOOLEAN NOT NULL, "
          + "  created_at TIMESTAMP NOT NULL, "
          + "  CONSTRAINT user_email_unique UNIQUE (email) "
          + ") "
        );
    });

    return engine;
};

module.exports = BaseRepository;
