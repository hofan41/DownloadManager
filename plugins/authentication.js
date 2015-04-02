var Hoek = require('hoek');
var Wreck = require('wreck');
var Joi = require('joi');

var internals = {};

internals.schema = Joi.object({
    logins: Joi.array().items(Joi.object().keys({
        provider: Joi.string(),
        clientId: Joi.string(),
        clientSecret: Joi.string(),
        scope: Joi.array().items(Joi.string())
    }).with('clientId', 'clientSecret')).required()
});

exports.register = function(server, options, next) {
    Joi.assert(options, internals.schema);

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
    internals.supportedProviders = [];

    options.logins.forEach(function(login) {
        if (login.clientId) {
            internals.supportedProviders.push(login.provider);

            server.auth.strategy(login.provider, 'bell', {
                provider: login.provider,
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: login.clientId,
                clientSecret: login.clientSecret,
                isSecure: false,
                scope: login.scope
            });

            server.route({
                method: 'GET',
                path: '/auth/' + login.provider,
                config: {
                    auth: login.provider,
                    handler: function(request, reply) {
                        if (request.auth.isAuthenticated) {
                            request.auth.session.set(
                                request.auth.credentials
                            );
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
            reply.redirect(request.info.referrer);
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

            return reply.view('error', context).code(error.output.statusCode);
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