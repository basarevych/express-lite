/**
 * Services
 */

'use strict'

module.exports = function (app) {
    return {
        services: {
            "http-server": {
                path: "app/services/http-server.js",
                instantiate: true,
            },
            "user-repository": {
                path: "app/repositories/user.js",
                instantiate: true,
            },
        },
    };
};
