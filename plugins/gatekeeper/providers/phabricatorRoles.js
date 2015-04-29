'use strict';

var Joi = require('joi');
var Hoek = require('hoek');
var Promise = require('promise');

var internals = {};

internals.accessSchema = Joi.object().pattern(/.+/, Joi.boolean());

internals.schema = Joi.array().items(Joi.object({
    roleName: Joi.string().required(),
    accessRights: internals.accessSchema.required()
}));


exports.register = function(server, options, next) {
    var result = Joi.validate(options, internals.schema);

    Hoek.assert(!result.error, 'Failed Joi validation: ' + result.error);

    var settings = result.value;

    // Requires the session plugin
    server.dependency(['gatekeeper']);

    // Called by gatekeeper when user has logged in successfully via this provider.
    server.expose('onLoginSuccess', function(request) {
        return new Promise(function(accept) {
            var userRoles = request.auth.credentials.profile.raw.result.roles;
            settings.forEach(function(role) {
                // If we find a role that matches the user's roles
                if (userRoles.indexOf(role.roleName) > -1) {
                    // Update the user access rights with those specified in the settings.
                    server.methods.updateUserAccessRights(request, role.accessRights);
                }
            });
            return accept();
        });
    });

    next();
};

exports.register.attributes = {
    name: 'phabricatorRoles',
    version: '0.0.1'
};