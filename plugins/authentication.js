var Config = require('../config');
var Hoek = require('hoek');

var internals = {};

exports.register = function(server, options, next) {
    server.register([
            require('hapi-require-https'),
            require('bell'),
            require('hapi-auth-cookie')
        ],
        function(err) {
            Hoek.assert(!err, 'Failed loading plugin: ' + err);

            server.auth.strategy('session', 'cookie', 'try', {
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                isSecure: false
            });
        });

    // Register Third Party Logins
    internals.providers = Object.keys(Config.login);
    internals.supportedProviders = [];

    internals.providers.forEach(function(provider) {
        var cred = Config.login[provider];

        if (cred.clientId) {
            internals.supportedProviders.push(provider);

            server.auth.strategy(provider, 'bell', {
                provider: provider,
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: cred.clientId,
                clientSecret: cred.clientSecret,
                isSecure: false
            });

            server.route({
                method: 'GET',
                path: '/auth/' + provider,
                config: {
                    auth: provider,
                    handler: function(request, reply) {
                        if (request.auth.isAuthenticated) {
                            request.auth.session.set(
                                request.auth
                                .credentials);
                            reply.redirect('/.');
                        }
                    }
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/logout',
        handler: function(request, reply) {
            request.auth.session.clear();
            reply.redirect('/.');
        }
    });

    server.ext('onPreResponse', function(request, reply) {
        // Leave API responses alone
        if (request.route.settings.app.isAPI) {
            return reply.continue();
        }

        var response = request.response;

        if (response.isBoom) {
            var error = response;

            var context = {
                supportedProviders: internals.supportedProviders,
                error: error.output.payload.error,
                message: error.output.payload.message,
                code: error.output.statusCode
            };

            if (request.auth.isAuthenticated) {
                context.profile = request.auth.credentials.profile;
            }

            return reply.view('error', context);
        }

        if (response.variety === 'view') {
            var context = response.source.context || {};

            if (request.auth.isAuthenticated) {
                context.profile = request.auth.credentials.profile;
            }

            context.supportedProviders = internals.supportedProviders;
        }

        return reply.continue();
    });

    next();

};

exports.register.attributes = {
    name: 'authentication',
    version: '0.0.1'
};