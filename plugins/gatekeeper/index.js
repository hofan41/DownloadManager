'use strict';

var Hoek = require('hoek');
var Joi = require('joi');
var Promise = require('promise');
var Handlers = require('./handlers');

var internals = {};

internals.defaults = {
    cookie: {
        isSecure: true
    }
};

internals.accessSchema = Joi.object().pattern(/.+/, Joi.boolean());

internals.accessRights = Joi.object({
    anonymous: internals.accessSchema.required(),
    authenticated: internals.accessSchema.required()
}).required();

internals.schema = Joi.object({
    accessRights: internals.accessRights,
    cookie: Joi.object({
        password: Joi.string().required(),
        isSecure: Joi.boolean()
    }).required(),
    logins: Joi.array().items(Joi.object({
        provider: Joi.string().required(),
        clientId: Joi.string(),
        clientSecret: Joi.string(),
        scope: Joi.array().items(Joi.string()),
        plugins: Joi.array().items(Joi.object().keys({
            register: Joi.any(),
            options: Joi.any()
        }), Joi.string())
    }).min(1).and('clientId', 'clientSecret')).required()
});

exports.register = function(server, options, next) {

    var result = Joi.validate(Hoek.applyToDefaults(internals.defaults, options), internals.schema);

    Hoek.assert(!result.error, 'Failed Joi validation: ' + result.error);

    var settings = result.value;

    server.register([
            require('hapi-require-https'),
            require('bell'),
            require('hapi-auth-cookie')
        ],
        function(err) {
            Hoek.assert(!err, 'Failed loading plugin: ' + err);

            server.auth.strategy('session', 'cookie', 'try', {
                password: settings.cookie.password,
                isSecure: settings.cookie.isSecure
            });
        });

    server.method([{
        name: 'getUserAccessRights',
        method: function(request) {
            if (request.auth.isAuthenticated === true) {
                return request.auth.credentials.userAccessRights;
            }

            return this.accessRights.anonymous;
        },
        options: {
            bind: settings
        }
    }, {
        name: 'updateUserAccessRights',
        method: function(request, accessRights) {
            var result = Joi.validate(accessRights, internals.accessSchema);
            Hoek.assert(!result.error, 'Failed Joi validation: ' + result.error);
            Hoek.assert(request.auth.isAuthenticated === true,
                'Should not be updating access rights for anonymous!');
            var currentAccessRights = {};

            // Initialize session variable if it doesn't exist.
            if (!request.auth.credentials.hasOwnProperty('userAccessRights')) {
                request.auth.session.set('userAccessRights', {});
            } else {
                currentAccessRights = Hoek.clone(request.auth.credentials.userAccessRights);
            }

            Object.keys(result.value).forEach(function(accessRight) {
                // If the new access right grants us new rights
                if (result.value[accessRight] === true) {
                    currentAccessRights[accessRight] = true;
                }

                // If the new access right is not defined in the current object
                else if (!currentAccessRights.hasOwnProperty(accessRight)) {
                    currentAccessRights[accessRight] = false;
                }
            });

            // Update session variable.
            request.auth.session.set('userAccessRights', currentAccessRights);
        }
    }]);

    server.route({
        method: 'GET',
        path: '/logout',
        handler: Handlers.logOut
    });

    server.ext('onPreResponse', Handlers.onPreResponse, {
        bind: {
            internals: internals,
            server: server
        }
    });

    // Register Third Party Logins
    internals.supportedProviders = [];

    // Set up third party login systems using bell.
    settings.logins.forEach(function(login) {
        if (login.clientId) {
            internals.supportedProviders.push(login.provider);

            server.auth.strategy(login.provider, 'bell', {
                provider: login.provider,
                password: settings.cookie.password,
                clientId: login.clientId,
                clientSecret: login.clientSecret,
                isSecure: settings.cookie.isSecure,
                scope: login.scope
            });

            // Register any additional plugins
            if (login.plugins) {
                server.register(login.plugins, function(err) {
                    Hoek.assert(!err, 'Failed loading plugin: ' + err);
                });
            }

            server.route({
                method: 'GET',
                path: '/auth/' + login.provider,
                config: {
                    auth: login.provider,
                    handler: function(request, reply) {
                        if (request.auth.isAuthenticated) {
                            var loginSuccessCallbacks = [];

                            request.auth.session.set(
                                request.auth.credentials
                            );

                            server.methods.updateUserAccessRights(request, settings.accessRights.authenticated);

                            if (login.plugins) {
                                login.plugins.forEach(function(plugin) {
                                    var pluginName = plugin.register.attributes.name;

                                    if (server.plugins.hasOwnProperty(pluginName) &&
                                        server.plugins[pluginName].hasOwnProperty('onLoginSuccess')) {

                                        // Call the plugin login success handler
                                        loginSuccessCallbacks.push(server.plugins[pluginName][
                                            'onLoginSuccess'
                                        ](request));
                                    }
                                });
                            }

                            // Wait for all of the login success callbacks to finish
                            Promise.all(loginSuccessCallbacks).then(function() {
                                reply.redirect('/.');
                            });
                        }
                    }
                }
            });
        }
    });

    next();

};

exports.register.attributes = {
    name: 'gatekeeper',
    version: '0.0.1'
};