'use strict';

var Joi = require('joi');
var Hoek = require('hoek');
var Promise = require('promise');
var GithubApi = require('github');

var internals = {};

internals.accessSchema = Joi.object().pattern(/.+/, Joi.boolean());

internals.schema = Joi.object({
    teams: Joi.array().items(Joi.object({
        teamId: Joi.number().required(),
        accessRights: internals.accessSchema.required()
    })).required()
}).required();


exports.register = function(server, options, next) {
    var result = Joi.validate(options, internals.schema);

    Hoek.assert(!result.error, 'Failed Joi validation: ' + result.error);

    var settings = result.value;

    // Requires the session plugin
    server.dependency(['hapi-auth-cookie', 'gatekeeper']);

    internals.github = new GithubApi({
        version: '3.0.0'
    });

    // Called by gatekeeper when user has logged in successfully via this provider.
    server.expose('onLoginSuccess', function(request) {

        // Start parallel api calls to github to check membership in all teams specified in settings.
        return Promise.all(settings.teams.map(internals.checkTeamMembership, request.auth.credentials))

        .then(function(results) {

            // Once all parallel api calls are done, update the user access rights
            results.forEach(function(team) {
                if (team.isInTeam === true) {
                    server.methods.updateUserAccessRights(request, team.accessRights);
                }
            });
        });
    });

    next();
};

exports.register.attributes = {
    name: 'githubTeams',
    version: '0.0.1'
};

internals.checkTeamMembership = function(team) {
    var self = this;

    return new Promise(function(accept) {

        // First authenticate with the access token.
        internals.github.authenticate({
            type: 'oauth',
            token: self.token
        });

        // Call github api to check that the user is a member of the team.
        internals.github.orgs.getTeamMember({
            id: team.teamId,
            user: self.profile.username
        }, function(err) {
            if (err) {
                team.isInTeam = false;
                accept(team);
            } else {
                team.isInTeam = true;
                accept(team);
            }
        });
    });
};