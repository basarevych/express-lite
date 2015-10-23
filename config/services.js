/**
 * Services
 */

'use strict'

module.exports = function (app) {
    return {
        services: {
            "http-server": {
                path: "services/http-server.js",
                instantiate: true,
            },
            "user-repository": {
                path: "repositories/user.js",
                instantiate: true,
            },
        },
    };
};
