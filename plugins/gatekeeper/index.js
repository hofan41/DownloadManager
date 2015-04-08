'use strict';

var Hoek = require('hoek');
var Joi = require('joi');
var Promise = require('promise');
var Handlers = require('./handlers');
var JoiSchemas = require('./joiSchemas');

var internals = {};

exports.register = function(server, options, next) {

    var result = Joi.validate(Hoek.applyToDefaults(JoiSchemas.pluginDefaultConfig, options), JoiSchemas.pluginConfig);

    Hoek.assert(!result.error, 'Failed Joi validation: ' + result.error);

    var settings = result.value;

    server.register([
            require('hapi-require-https'),
            require('bell'),
            require('hapi-auth-cookie')
        ],
        function(err) {
            Hoek.assert(!err, 'Failed loading plugin: ' + err);

            server.auth.strategy('session', 'cookie', 'optional', {
                password: settings.cookie.password,
                isSecure: settings.cookie.isSecure,
                ttl: settings.cookie.ttl
            });
        });

    server.bind({
        accessRights: settings.accessRights
    });

    server.method(require('./methods'));

    server.route({
        method: 'GET',
        path: '/logout',
        handler: Handlers.logOut
    });

    server.ext('onPreResponse', Handlers.onPreResponse, {
        bind: internals
    });

    server.ext('onPreHandler', Handlers.onPreHandler);

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

                            server.methods.updateUserAccessRights(request, this.accessRights.authenticated);

                            if (login.plugins) {
                                login.plugins.forEach(function(plugin) {
                                    var pluginName = plugin.register.attributes.name;

                                    if (server.plugins.hasOwnProperty(pluginName) &&
                                        server.plugins[pluginName].hasOwnProperty('onLoginSuccess')) {

                                        // Call the plugin login success handler
                                        loginSuccessCallbacks.push(server.plugins[pluginName].onLoginSuccess(
                                            request));
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