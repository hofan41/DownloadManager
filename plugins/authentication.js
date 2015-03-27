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
        var response = request.response;
        if (response.variety === 'view' && request.auth.isAuthenticated) {
            var context = response.source.context || {};
            context.profile = request.auth.credentials.profile;
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