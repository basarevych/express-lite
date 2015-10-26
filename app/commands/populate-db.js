/**
 * Populate the database command
 */

'use strict'

var locator = require('node-service-locator');
var UserModel = require('../models/user');

module.exports = function (argv, rl) {
    var config = locator.get('config');

    function info(done) {
        rl.write("\tpopulate-db\t\tPopulate the database\n");
        done();
    }

    function help(done) {
        rl.write("\nUsage:\tbin/cmd populate-db\n\n");
        rl.write("\tThis command will populate the database with initial data\n");
        done();
    }

    function run(done) {
        var logger = locator.get('logger');
        var userRepo = locator.get('user-repository');

        rl.write("==> Initializing the database\n");
        rl.question("-> Administrator email? ", function (email) {
            rl.question("-> Administrator password? ", function (password) {
                userRepo.findByEmail(email)
                    .then(function (users) {
                        var user = users.length && users[0];
                        if (!user) {
                            user = new UserModel();
                            user.setName('Admin');
                            user.setEmail(email);
                            user.setIsAdmin(true);
                        }

                        user.setPassword(UserModel.encryptPassword(password));
                        user.save()
                            .then(function (userId) {
                                rl.close();
                                done();
                            })
                            .catch(function (err) {
                                console.error(err);
                                process.exit(1);
                            });
                    })
                    .catch(function (err) {
                        console.error(err);
                        process.exit(1);
                    });
            })
        });
    }

    return {
        info: info,
        help: help,
        run: run,
    };
};
